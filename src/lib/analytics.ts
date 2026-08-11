import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

// Helper to generate a unique session ID per browser tab session
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

  if (/mobile/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  }

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

// Fetch user's country using a free IP lookup API (cached in sessionStorage)
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
    console.warn('Could not auto-detect country, using default.');
  }

  return 'India';
}

/**
 * Checks if the currently logged-in Firebase user is an admin.
 * Result is cached in sessionStorage to avoid repeated Firestore reads per session.
 */
async function isAdminUser(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const cacheKey = `codebazaar_is_admin_${user.uid}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached !== null) return cached === 'true';

  try {
    const userDocSnap = await getDoc(doc(db, 'users', user.uid));
    const role = userDocSnap.data()?.role;
    const admin = role === 'admin';
    sessionStorage.setItem(cacheKey, String(admin));
    return admin;
  } catch {
    return false;
  }
}

/**
 * Tracks a behavioral event to Firestore under the 'analytics_events' collection.
 *
 * ADMIN EXCLUSION — Two-layer guard:
 *   1. Synchronous: checks localStorage for cached role (instant, covers page load race condition)
 *   2. Async: reads Firestore user profile if no cached role found
 * Admin users are NEVER tracked. Only real public visitors generate analytics events.
 *
 * Runs asynchronously (fire-and-forget) to never block user interaction.
 */
export function trackEvent(eventName: string, metadata: Record<string, any> = {}): void {
  // ── Fast synchronous admin check (catches page load race condition) ────
  // AuthContext saves the role to localStorage as soon as the profile loads.
  const cachedRole = localStorage.getItem('codebazaar_user_role');
  if (cachedRole === 'admin') return; // Instant exit — no async needed

  (async () => {
    try {
      // ── Async admin check (Firestore) for sessions without cached role ──
      const adminCheck = await isAdminUser();
      if (adminCheck) return;

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
      console.warn('Event tracking failed:', err);
    }
  })();
}

