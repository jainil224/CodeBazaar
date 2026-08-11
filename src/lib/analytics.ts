import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Helper to generate a unique session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('codebazaar_session_id');
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('codebazaar_session_id', sessionId);
  }
  return sessionId;
}

// Simple parsing of User Agent to get Device, Browser, OS
function getDeviceDetails() {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  let browser = 'Other';
  let os = 'Other';

  // 1. Device Type
  if (/mobile/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  }

  // 2. Browser detection
  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|iceweasel/i.test(ua)) {
    browser = 'Firefox';
  } else if (/edge|edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
  }

  // 3. Operating System detection
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/ipad|iphone|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return { device, browser, os };
}

// Fetch user's country using a free API (cached in sessionStorage)
async function getCountry(): Promise<string> {
  const cached = sessionStorage.getItem('codebazaar_user_country');
  if (cached) return cached;

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.country_name) {
        sessionStorage.setItem('codebazaar_user_country', data.country_name);
        return data.country_name;
      }
    }
  } catch (e) {
    // Silently fallback if blocked or offline
    console.warn("Could not auto-detect country, using default.");
  }
  
  // Default fallback for CodeBazaar (mainly India)
  return 'India';
}

/**
 * Tracks a behavioral event to Firestore under the 'analytics_events' collection.
 * This runs asynchronously (fire-and-forget) to never block user interaction.
 */
export function trackEvent(eventName: string, metadata: Record<string, any> = {}): void {
  // Fire-and-forget execution
  (async () => {
    try {
      const sessionId = getSessionId();
      const { device, browser, os } = getDeviceDetails();
      const country = await getCountry();

      const user = auth.currentUser;
      const userId = user?.uid || 'anonymous';
      const userEmail = user?.email || null;

      const payload = {
        eventName,
        sessionId,
        userId,
        userEmail,
        pagePath: window.location.pathname,
        pageTitle: document.title,
        device,
        browser,
        os,
        country,
        metadata,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'analytics_events'), payload);
    } catch (err) {
      // Catch errors silently so that analytics failures never disrupt the user experience
      console.warn("Event tracking failed:", err);
    }
  })();
}
