import React, { useState } from 'react';
import { ArrowRight, User, Package, Heart, FileText, LogOut, ChevronDown, X } from 'lucide-react';
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
  const baseClasses = "bg-transparent border-none cursor-pointer font-sans text-[12px] font-semibold uppercase text-white/70 tracking-[0.06em] transition-all duration-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full";
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
      {/* ── Background Image ─────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none" aria-hidden="true">
        {/* Subtle top vignette */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 w-full flex justify-center pt-6 z-[20] px-4">
        <nav className="w-full max-w-[1100px] flex items-center justify-between px-6 py-3 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <img src={siteLogo} alt="CodeBazaar Logo" className="w-12 h-12 max-md:w-9 max-md:h-9" />
            <span className="font-display text-[26px] text-white tracking-tight leading-none max-md:text-[22px]">
              codebazaar
            </span>
          </div>

          {/* Center Links */}
          <div className="flex gap-2 max-md:hidden">
            <NavButton href="#projects">Browse Templates</NavButton>
            <NavButton href="#how-to-get-code">How It Works</NavButton>
            <NavButton href="#faqs">FAQs</NavButton>
          </div>

        {/* Right Links & CTAs */}
        <div className="flex items-center gap-3.5 relative">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans text-[11px] font-semibold uppercase tracking-[0.06em] px-4.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all cursor-pointer select-none shrink-0"
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.name} 
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-mono shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-sm:hidden">My Account</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
 
              {/* Dropdown Menu Box */}
              {isDropdownOpen && (
                <>
                  {/* Click outside backdrop overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  
                  <div className="absolute right-0 mt-3.5 w-72 bg-[#0c0c14] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4 z-50 text-left">
                    {/* Header profile info */}
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={currentUser.name} 
                          className="w-11 h-11 rounded-full object-cover shadow-md shadow-purple-900/30 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-base font-black font-mono shadow-md shadow-purple-900/30 select-none shrink-0">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-white text-sm truncate leading-tight">{currentUser.name}</h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border shrink-0 ${
                            currentUser.role === 'admin' 
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                              : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                          }`}>
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 truncate font-mono mt-1">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="border-b border-white/5 w-full my-0.5" />

                    {/* Menu links list */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); setIsProfileOpen(true); }}
                        className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3.5 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                      >
                        <span className="flex items-center gap-3">
                          <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                          My Profile
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => { setIsDropdownOpen(false); onAdminClick(); }}
                          className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3.5 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                        >
                          <span className="flex items-center gap-3">
                            <User className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform duration-200" />
                            Admin Console
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-pink-400 transition-colors" />
                        </button>
                      )}

                      <button
                        onClick={() => { setIsDropdownOpen(false); onMyPurchasesClick(); }}
                        className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3.5 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                      >
                        <span className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                          My Orders
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </button>

                      <button
                        onClick={handleWishlistClick}
                        className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3.5 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                      >
                        <span className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                          Wishlist
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </button>

                      <button
                        onClick={() => { setIsDropdownOpen(false); setIsTermsOpen(true); }}
                        className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white px-3.5 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                      >
                        <span className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                          Terms & Conditions
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </button>
                    </div>

                    <div className="border-b border-white/5 w-full my-0.5" />

                    {/* Exit action */}
                    <button
                      onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                      className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 px-3.5 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 hover:translate-x-0.5 cursor-pointer w-full text-left group"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Logout
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-500/20 group-hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="max-md:hidden">
                <NavButton onClick={onLoginClick}>Login</NavButton>
              </div>
              <button 
                onClick={onLoginClick}
                className="bg-white text-black font-sans text-[11px] font-bold uppercase tracking-[0.06em] px-5 py-2.5 rounded-full transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.1)] cursor-pointer shrink-0"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>
    </div>

      {/* Hero Body */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            }
          }
        }}
        className="relative z-[2] flex-1 flex flex-col items-center justify-center px-6 text-center max-w-[950px] mx-auto py-20"
      >
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 text-xs text-white/70 font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
          <span>Flat ₹50 Code Marketplace</span>
        </motion.div>
        
        <motion.h1 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="hero-title text-[clamp(40px,5.5vw,68px)] text-white leading-[1.1] mb-6 max-w-[900px]"
        >
          <span className="serif-italic underline decoration-[3.5px] underline-offset-[8px] md:underline-offset-[12px] decoration-primary-indigo">CodeBazaar</span>, Ready-to-Use Projects & Complete <span className="serif-italic underline decoration-[3.5px] underline-offset-[8px] md:underline-offset-[12px] decoration-primary-pink">Source Code</span>
        </motion.h1>
        
        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="font-sans text-base sm:text-lg font-medium text-white/60 leading-relaxed max-w-[720px] mb-10"
        >
          Discover practical projects, premium UI templates, and complete source code — available for just ₹50. Choose a project, purchase it securely, and download the code instantly.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a 
            href="#projects"
            className="group bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange hover:brightness-110 text-white font-semibold py-4 px-8 rounded-2xl flex items-center gap-2.5 shadow-[0_8px_24px_rgba(61,90,254,0.3)] hover:shadow-[0_8px_32px_rgba(61,90,254,0.45)] active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wider"
          >
            <span>Start Exploring Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-to-get-code"
            className="bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold py-4 px-8 rounded-2xl border border-white/10 hover:border-white/20 active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wider"
          >
            Explore Workflow
          </a>
        </motion.div>
      </motion.div>

      {/* Empty bottom element to align centering */}
      <div className="h-20 max-md:hidden"></div>

      {/* ── PROFILE MODAL ─────────────────── */}
      {isProfileOpen && currentUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Click backdrop to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsProfileOpen(false)} />
          
          <div className="bg-[#0c0c14] border border-white/10 rounded-[32px] p-8 w-full max-w-[420px] shadow-2xl relative text-left z-10">
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-purple-500/25 select-none font-mono">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-white mt-4">{currentUser.name}</h3>
              <p className="text-[10px] text-purple-400 font-mono tracking-wider uppercase font-bold mt-1">{currentUser.role} Account</p>
              
              <div className="w-full border-t border-white/5 my-6" />
              
              <div className="w-full space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Email Address:</span>
                  <span className="text-white/80 font-bold truncate max-w-[200px]">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">License Scope:</span>
                  <span className="text-white/80 font-bold">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Standard Buyer'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">My Files:</span>
                  <button 
                    onClick={() => { setIsProfileOpen(false); onMyPurchasesClick(); }}
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

      {/* ── TERMS MODAL ─────────────────── */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Click backdrop to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsTermsOpen(false)} />
          
          <div className="bg-[#0c0c14] border border-white/10 rounded-[32px] p-8 w-full max-w-[480px] shadow-2xl relative text-left z-10 flex flex-col max-h-[85vh]">
            <button 
              onClick={() => setIsTermsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-black text-white mb-6">Terms & Conditions</h3>
            
            <div className="flex-1 overflow-y-auto space-y-5 text-xs text-white/50 leading-relaxed pr-2 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10">
              <div>
                <h4 className="font-bold text-white mb-1.5 uppercase tracking-wider text-[10px] text-purple-400">1. Digital Purchase License</h4>
                <p>All items on CodeBazaar are digital products. Upon payment of the listed price, you are granted a non-transferable, non-exclusive license to download, view, and customize the source code. You may not resell or redistribute the source files.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-1.5 uppercase tracking-wider text-[10px] text-purple-400">2. Refund Guidelines</h4>
                <p>Due to the nature of digital assets, once the files are purchased and made available for direct zip downloads, all sales are final. Refunds are not issued except in documented cases of payment processing errors.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-1.5 uppercase tracking-wider text-[10px] text-purple-400">3. System Support</h4>
                <p>All source code projects are delivered "as-is". Support and updates are provided on a best-effort basis. If you have inquiries, please use the Contact Us link to reach our helpdesk.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
