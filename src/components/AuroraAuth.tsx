import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Circle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/firebase';


interface AuroraAuthProps {
  onClose: () => void;
}

export default function AuroraAuth({ onClose }: AuroraAuthProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Maps Firebase auth error codes to friendly messages
  const getFriendlyError = (code: string): string => {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email. Please sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Incorrect email or password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
      'auth/cancelled-popup-request': '',  // silent — user just opened another popup
    };
    return map[code] ?? 'Authentication failed. Please try again.';
  };

  // Staggered reveal animations for left hero column
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as any }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && (!firstName || !lastName))) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Step 1: Create Firebase Auth account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const role = email.toLowerCase() === 'admin@codebazaar.com' ? 'admin' : 'user';
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        // Step 2: Write profile to Firestore (separate try so auth isn't blocked)
        try {
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            name: fullName,
            role,
            purchasedIds: []
          });
        } catch (firestoreErr: any) {
          // Auth succeeded — Firestore rules may not be updated yet.
          // User is logged in; profile will be retried on next sign-in.
          console.warn('Profile write blocked (update Firestore rules):', firestoreErr.code);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onClose();
    } catch (err: any) {
      const msg = getFriendlyError(err.code);
      if (msg) setError(msg);
      else setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (platform: string) => {
    if (platform === 'Google') {
      setIsLoading(true);
      setError('');
      try {
        // Step 1: Google Auth popup
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Step 2: Write profile to Firestore if new user (separate try)
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const role = user.email?.toLowerCase() === 'admin@codebazaar.com' ? 'admin' : 'user';
            await setDoc(userRef, {
              email: user.email || '',
              name: user.displayName || 'Google User',
              role,
              purchasedIds: []
            });
          }
        } catch (firestoreErr: any) {
          console.warn('Profile write blocked (update Firestore rules):', firestoreErr.code);
        }

        onClose();
      } catch (err: any) {
        const msg = getFriendlyError(err.code);
        if (msg) setError(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 text-white">
      
      {/* ── Left Column: Hero & Background Video ── */}
      <section className="relative hidden lg:flex w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Hero Content Staggered Animation */}
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-xs space-y-8 flex flex-col items-center text-center"
        >
          {/* Logo */}
          <motion.div variants={heroItemVariants} className="flex items-center gap-2 select-none">
            <Circle className="w-5 h-5 fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight text-white">Aurora</span>
          </motion.div>

          {/* Heading Block */}
          <motion.div variants={heroItemVariants} className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tight text-white whitespace-nowrap">
              {isSignUp ? 'Join Aurora' : 'Welcome Back'}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              {isSignUp 
                ? 'Follow these 3 quick phases to activate your space.' 
                : 'Sign in to access your purchased project files.'}
            </p>
          </motion.div>

          {/* Steps (Visible for Sign Up) */}
          {isSignUp && (
            <motion.div variants={heroItemVariants} className="w-full space-y-3">
              <StepItem number={1} text="Register your identity" active />
              <StepItem number={2} text="Configure your studio" />
              <StepItem number={3} text="Finalize your profile" />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Right Column: Sign Up Form ── */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden bg-black relative">
        {/* Back Button */}
        <button 
          onClick={onClose}
          className="absolute left-6 top-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer text-sm font-medium z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" as any }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          {/* Header */}
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-medium tracking-tight text-white">
              {isSignUp ? 'Create New Profile' : 'Sign In to Profile'}
            </h2>
            <p className="text-white/40 text-sm">
              {isSignUp 
                ? 'Input your basic details to begin the journey.' 
                : 'Access your purchased items and templates.'}
            </p>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-4">
            <SocialButton 
              onClick={() => handleSocialLogin('Google')}
              icon={
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.73 0 3.3.63 4.52 1.67l2.42-2.42C17.29 1.62 14.86 1 12.24 1 6.6 1 2 5.6 2 11.2s4.6 10.2 10.24 10.2c5.88 0 10.24-4.14 10.24-10.2 0-.69-.06-1.35-.18-1.915H12.24Z" />
                </svg>
              } 
              label="Google" 
            />
            <SocialButton 
              onClick={() => handleSocialLogin('GitHub')}
              icon={
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              } 
              label="GitHub" 
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest select-none">
              Or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Special Admin Hint */}
            {!isSignUp && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-white/60 text-center">
                💡 Tip: Enter <code className="text-purple-300">admin@codebazaar.com</code> to login as Admin
              </div>
            )}
            
            {/* First & Last Name Grid (Only for Sign Up) */}
            {isSignUp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup 
                  label="First Name" 
                  placeholder="Jane" 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <InputGroup 
                  label="Last Name" 
                  placeholder="Doe" 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            ) : null}

            {/* Email field */}
            <InputGroup 
              label="Email" 
              placeholder="name@example.com" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password field */}
            <div className="flex flex-col gap-2 w-full text-left">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-gray border-none rounded-xl h-11 pl-4 pr-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <p className="text-[11px] text-white/40 mt-1">Requires at least 8 symbols.</p>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-4 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer inline-block bg-transparent border-none"
            >
              {isSignUp ? (
                <>Member of the team? <span className="underline">Log in</span></>
              ) : (
                <>New to the platform? <span className="underline">Create an account</span></>
              )}
            </button>
          </div>

        </motion.div>
      </section>

    </div>
  );
}

// ─── REUSABLE COMPONENTS ───────────────────────────────────

interface StepItemProps {
  number: number;
  text: string;
  active?: boolean;
}

export function StepItem({ number, text, active }: StepItemProps) {
  return (
    <div 
      className={`flex items-center gap-4 px-4 py-3 rounded-2xl w-full text-left transition-colors duration-300 ${
        active 
          ? 'bg-white text-black border border-white' 
          : 'bg-brand-gray text-white border-none'
      }`}
    >
      <span 
        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
          active 
            ? 'bg-black text-white' 
            : 'bg-white/10 text-white/40'
        }`}
      >
        {number}
      </span>
      <span className="text-sm font-medium tracking-tight">
        {text}
      </span>
    </div>
  );
}

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className="flex items-center justify-center gap-3 w-full h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all duration-200 text-sm font-medium cursor-pointer text-white"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface InputGroupProps {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputGroup({ label, placeholder, type, value, onChange }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label className="text-sm font-medium text-white">
        {label}
      </label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        className="bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
        required
      />
    </div>
  );
}
