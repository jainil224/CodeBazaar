import React, { useState } from 'react';
import { ArrowRight, User, Package, Heart, FileText, LogOut, ChevronDown, X, Sparkles, Zap, Shield } from 'lucide-react';
import siteLogo from '@/assets/logo.svg';
import { motion } from 'framer-motion';

interface HeroProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user'; photoURL?: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminClick: () => void;
  onMyPurchasesClick: () => void;
}

const NavButton = ({ children, href, onClick, className = '' }: { children: React.ReactNode, href?: string, onClick?: () => void, className?: string }) => {
  const baseClasses = "bg-transparent border-none cursor-pointer font-sans text-[11px] sm:text-xs font-semibold uppercase text-white/60 tracking-[0.06em] transition-all duration-300 hover:text-white hover:bg-white/[0.07] px-3 sm:px-4 py-2 rounded-full";
  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

export default function Hero({ currentUser, onLoginClick, onLogout, onAdminClick, onMyPurchasesClick }: HeroProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleWishlistClick = () => {
    setIsDropdownOpen(false);
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'projects';
    }
  };

  return (
    <section className="relative min-h-svh w-full overflow-hidden flex flex-col justify-between">
      {/* ── Background with subtle vignette ─────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-10" />
      </div>

      {/* ═══ NAVIGATION BAR ═══════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 w-full flex justify-center pt-4 sm:pt-6 z-[20] px-3 sm:px-4">
        <nav
          className="w-full max-w-[1140px] flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 select-none shrink-0">
            <img src={siteLogo} alt="CodeBazaar Logo" className="w-9 h-9 sm:w-11 sm:h-11" />
            <span className="font-display text-lg sm:text-[26px] text-white tracking-tight leading-none">
              codebazaar
            </span>
          </div>

          {/* Center Links — Hidden on mobile */}
          <div className="hidden md:flex gap-1">
            <NavButton href="#projects">Templates</NavButton>
            <NavButton href="#how-to-get-code">How It Works</NavButton>
            <NavButton href="#faqs">FAQs</NavButton>
          </div>

          {/* Right: Auth CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer select-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                  }}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold font-mono shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">Account</span>
                  <ChevronDown
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/50 transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div
                      className="absolute right-0 mt-3 w-64 sm:w-72 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 sm:gap-4 z-50 text-left"
                      style={{
                        background: '#0c0c14',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {/* Profile header */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.name}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-black font-mono shadow-md select-none shrink-0"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                          >
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-white text-xs sm:text-sm truncate leading-tight">
                              {currentUser.name}
                            </h4>
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider shrink-0 ${
                                currentUser.role === 'admin'
                                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                                  : 'bg-zinc-500/15 border border-zinc-500/30 text-zinc-400'
                              }`}
                            >
                              {currentUser.role}
                            </span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-white/40 truncate font-mono mt-0.5">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="border-b border-white/[0.06]" />

                      {/* Menu items */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsProfileOpen(true);
                          }}
                          className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer w-full text-left group"
                        >
                          <span className="flex items-center gap-2.5">
                            <User className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            My Profile
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onAdminClick();
                            }}
                            className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer w-full text-left group"
                          >
                            <span className="flex items-center gap-2.5">
                              <User className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                              Admin Console
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-pink-400 transition-colors" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onMyPurchasesClick();
                          }}
                          className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer w-full text-left group"
                        >
                          <span className="flex items-center gap-2.5">
                            <Package className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            My Orders
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </button>

                        <button
                          onClick={handleWishlistClick}
                          className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer w-full text-left group"
                        >
                          <span className="flex items-center gap-2.5">
                            <Heart className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            Wishlist
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsTermsOpen(true);
                          }}
                          className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer w-full text-left group"
                        >
                          <span className="flex items-center gap-2.5">
                            <FileText className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            Terms
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </button>
                      </div>

                      <div className="border-b border-white/[0.06]" />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer w-full text-left group"
                      >
                        <span className="flex items-center gap-2.5">
                          <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Logout
                        </span>
                        <ArrowRight className="w-3 h-3 text-red-500/20 group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Login
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  style={{
                    background: '#fff',
                    color: '#000',
                    boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ═══ HERO BODY ════════════════════════════════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
        className="relative z-[2] flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-[980px] mx-auto py-20 sm:py-24 mt-16 sm:mt-20"
      >
        {/* Badge */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
          className="inline-flex items-center gap-2 px-4 sm:px-4.5 py-2 sm:py-2.5 rounded-full mb-5 sm:mb-6 text-[11px] sm:text-xs font-mono font-semibold shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(139,92,246,0.4)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
            color: '#fff',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]" />
          <span>Flat ₹50 Code Marketplace</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
          }}
          className="hero-title text-[clamp(32px,5vw,64px)] text-white leading-[1.08] mb-5 sm:mb-6 max-w-[900px]"
        >
          <span className="serif-italic underline decoration-[2.5px] sm:decoration-[3.5px] underline-offset-[6px] sm:underline-offset-[10px] decoration-purple-500">
            CodeBazaar
          </span>
          , Ready-to-Use Projects & Complete{' '}
          <span className="serif-italic underline decoration-[2.5px] sm:decoration-[3.5px] underline-offset-[6px] sm:underline-offset-[10px] decoration-pink-500">
            Source Code
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
          }}
          className="font-sans text-sm sm:text-base lg:text-lg font-medium text-white/55 leading-relaxed max-w-[680px] mb-8 sm:mb-10"
        >
          Discover practical projects, premium UI templates, and complete source code — available for just ₹50.
          Choose a project, purchase securely, and download instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
          }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href="#projects"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              color: '#fff',
              boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Exploring</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-to-get-code"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
            }}
          >
            How It Works
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } },
          }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12"
        >
          {[
            { icon: Zap, label: 'Instant Download', color: '#f59e0b' },
            { icon: Shield, label: 'Secure Payment', color: '#10b981' },
            { icon: Package, label: 'Full Source', color: '#8b5cf6' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-white/40 text-[10px] sm:text-xs font-medium">
              <div
                className="p-1.5 rounded-lg"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color }} />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom spacer for alignment */}
      <div className="h-12 sm:h-20" />

      {/* ═══ PROFILE MODAL ════════════════════════════════ */}
      {isProfileOpen && currentUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsProfileOpen(false)} />
          <div
            className="rounded-3xl p-6 sm:p-8 w-full max-w-[400px] shadow-2xl relative text-left z-10"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl transition-all cursor-pointer text-white/60 hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg select-none font-mono"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-4">{currentUser.name}</h3>
              <p className="text-[10px] text-purple-400 font-mono tracking-wider uppercase font-bold mt-1">
                {currentUser.role} Account
              </p>

              <div className="w-full border-t border-white/[0.06] my-5 sm:my-6" />

              <div className="w-full space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono text-[11px]">Email:</span>
                  <span className="text-white/80 font-bold truncate max-w-[180px] text-[11px]">
                    {currentUser.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono text-[11px]">License:</span>
                  <span className="text-white/80 font-bold text-[11px]">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono text-[11px]">My Files:</span>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onMyPurchasesClick();
                    }}
                    className="text-purple-400 hover:text-purple-300 font-extrabold cursor-pointer border-none bg-transparent underline uppercase tracking-wider text-[10px]"
                  >
                    View Purchases
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TERMS MODAL ══════════════════════════════════ */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsTermsOpen(false)} />
          <div
            className="rounded-3xl p-6 sm:p-8 w-full max-w-[480px] shadow-2xl relative text-left z-10 flex flex-col max-h-[85vh]"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => setIsTermsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl transition-all cursor-pointer text-white/60 hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg sm:text-xl font-black text-white mb-5 sm:mb-6">Terms & Conditions</h3>

            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 text-xs text-white/50 leading-relaxed pr-2 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div>
                <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] text-purple-400">
                  1. Digital Purchase License
                </h4>
                <p>
                  All items on CodeBazaar are digital products. Upon payment, you receive a non-transferable,
                  non-exclusive license to download and customize the source code. Redistribution is prohibited.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] text-purple-400">
                  2. Refund Guidelines
                </h4>
                <p>
                  Due to the digital nature, all sales are final once files are downloaded. Refunds only for documented
                  payment errors.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] text-purple-400">
                  3. System Support
                </h4>
                <p>
                  Source code is delivered "as-is". Support provided on best-effort basis. Contact us for inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
