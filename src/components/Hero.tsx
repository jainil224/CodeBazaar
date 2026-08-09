import React from 'react';
import { Code2, ArrowRight } from 'lucide-react';

interface HeroProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminClick: () => void;
}

const NavButton = ({ children, href, onClick, className = '' }: { children: React.ReactNode, href?: string, onClick?: () => void, className?: string }) => {
  if (href) {
    return (
      <a href={href} className={`bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-white/80 tracking-[0.04em] transition-opacity hover:opacity-55 hover:text-white ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-white/80 tracking-[0.04em] transition-opacity hover:opacity-55 hover:text-white ${className}`}>
      {children}
    </button>
  );
};

export default function Hero({ currentUser, onLoginClick, onLogout, onAdminClick }: HeroProps) {
  return (
    <section className="relative min-h-svh w-full overflow-hidden flex flex-col justify-between">
      {/* ── Background Image ─────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none" aria-hidden="true">
        {/* Subtle top vignette */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-[2] max-w-[1360px] w-full mx-auto flex items-center justify-between px-20 pt-6 pb-4 max-md:px-6 max-md:pt-5">
        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <Code2 className="w-8 h-8 text-primary-indigo max-md:w-6 max-md:h-6" />
          <span className="font-display text-[40px] text-white leading-none max-md:text-[32px] bg-gradient-to-r from-primary-blue via-primary-pink to-primary-orange bg-clip-text text-transparent">
            codebazaar
          </span>
        </div>

        {/* Center Links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 max-md:hidden">
          <NavButton href="#projects">Browse Templates</NavButton>
          <NavButton href="#how-to-get-code">How It Works</NavButton>
          <NavButton href="#faqs">FAQs</NavButton>
        </div>

        {/* Right Links & CTAs */}
        <div className="flex items-center gap-6">
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <button 
                  onClick={onAdminClick}
                  className="bg-primary-indigo/20 border border-primary-indigo/35 text-primary-pink cursor-pointer font-sans text-[13px] font-semibold uppercase tracking-[0.04em] px-4 py-2 rounded-xl hover:bg-primary-indigo/40 active:scale-95 transition-all"
                >
                  Admin Panel
                </button>
              )}
              <span className="text-white/60 text-sm max-md:hidden">
                Hi, <strong className="text-white font-medium">{currentUser.name}</strong>
              </span>
              <button 
                onClick={onLogout}
                className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-white/80 tracking-[0.04em] transition-opacity hover:opacity-55"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-white/80 tracking-[0.04em] transition-opacity hover:opacity-55 max-md:hidden"
              >
                Login
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-white text-wandor-dark border-none cursor-pointer font-sans text-[15px] font-medium uppercase tracking-[0.04em] px-5 py-3.5 rounded-full transition-all hover:bg-white/90 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Body */}
      <div className="relative z-[2] flex-1 flex flex-col items-center justify-center px-6 text-center max-w-[950px] mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 text-xs text-white/70 font-mono">
          <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
          <span>Flat ₹50 Code Marketplace</span>
        </div>
        
        <h1 className="hero-title text-[clamp(40px,5.5vw,68px)] text-white leading-[1.1] mb-6 max-w-[900px]">
          <span className="serif-italic underline decoration-[3.5px] underline-offset-[8px] md:underline-offset-[12px] decoration-primary-indigo">CodeBazaar</span>, Ready-to-Use Projects & Complete <span className="serif-italic underline decoration-[3.5px] underline-offset-[8px] md:underline-offset-[12px] decoration-primary-pink">Source Code</span>
        </h1>
        
        <p className="font-sans text-base sm:text-lg font-medium text-white/60 leading-relaxed max-w-[720px] mb-10">
          Discover practical projects, premium UI templates, and complete source code — available for just ₹50. Choose a project, purchase it securely, and download the code instantly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
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
        </div>
      </div>

      {/* Empty bottom element to align centering */}
      <div className="h-20 max-md:hidden"></div>
    </section>
  );
}
