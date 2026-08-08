import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; role: 'admin' | 'user' }) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    // Role assignment logic
    const role = email.toLowerCase() === 'admin@codebazaar.com' ? 'admin' : 'user';
    const userName = isSignUp ? name : (role === 'admin' ? 'Administrator' : email.split('@')[0]);

    onSuccess({
      email,
      name: userName,
      role
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      {/* Glass card container */}
      <div className="relative w-full max-w-[420px] bg-white/[0.07] border-[2px] border-white/20 rounded-[32px] p-8 shadow-[0_0_24px_rgba(0,0,0,0.3)] backdrop-blur-[24px]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-display text-2xl text-white select-none">
            codebazaar
          </span>
          <h2 className="text-xl font-medium text-white/90 mt-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {isSignUp ? 'Get access to premium source codes' : 'Sign in to access your purchased files'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/20 border border-red-500/30 rounded-2xl text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Special Admin hint */}
          {!isSignUp && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-white/60 text-center">
              💡 Tip: Enter <code className="text-purple-300">admin@codebazaar.com</code> to login as Admin
            </div>
          )}

          {isSignUp && (
            <div className="relative">
              <label className="text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1.5 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder-white/35 focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1.5 block">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder-white/35 focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1.5 block">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-white text-sm placeholder-white/35 focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-wandor-dark font-medium py-3.5 rounded-2xl shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:bg-white/90 active:scale-98 transition-all cursor-pointer text-sm font-semibold uppercase tracking-wider"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
