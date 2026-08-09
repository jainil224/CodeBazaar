export default function Footer() {
  return (
    <footer className="relative z-10 w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
      {/* Floating Glassmorphism Footer Card Container */}
      <div className="relative max-w-[1240px] mx-auto rounded-[32px] sm:rounded-[40px] md:rounded-[48px] overflow-hidden border border-white/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.25)]">
        
        {/* Top Edge Glass Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Content Overlay */}
        <div className="relative flex flex-col justify-between pt-6 px-6 pb-0 sm:pt-10 sm:px-10 sm:pb-0 md:pt-12 md:px-12 md:pb-0 lg:pt-16 lg:px-16 lg:pb-0 z-20 font-mono text-white/70 text-[9px] sm:text-[11px] md:text-[13px] lg:text-[14px] tracking-[0.12em] md:tracking-[0.15em] uppercase">
          
          {/* Columns & Socials Grid */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-y-8 gap-x-4 text-left pt-4 sm:pt-6 md:pt-8">
            {/* Column 1: Projects */}
            <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
              <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">Projects</h4>
              <ul className="space-y-1.5 sm:space-y-2.5 text-white/60">
                <li><a href="#projects" className="hover:text-white transition-colors">Web Apps</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">UI Components</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">Full-Stack Projects</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">SaaS Templates</a></li>
              </ul>
            </div>

            {/* Column 2: How It Works */}
            <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
              <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">How It Works</h4>
              <ul className="space-y-1.5 sm:space-y-2.5 text-white/60">
                <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Browse Projects</a></li>
                <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Choose Your Code</a></li>
                <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Pay ₹50</a></li>
                <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Download ZIP</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
              <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2.5 text-white/60 font-semibold">
                <li><a href="#projects" className="hover:text-white transition-colors">About <span className="serif-italic normal-case tracking-normal text-[12px] sm:text-[14px] md:text-[16px] lg:text-[17px]">CodeBazaar</span></a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">Our Projects</a></li>
                <li><a href="#faqs" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#projects" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="col-span-2 md:col-span-6 flex flex-wrap justify-center sm:justify-between items-center gap-6 sm:gap-4 md:gap-0 pt-4 md:pt-[2px] font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-white/80 w-full">
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">X</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>

          {/* Bottom copyright & policy row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 pt-8 sm:pt-10 lg:pt-12 border-t border-white/20 text-white/80 font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] w-full mt-8 sm:mt-10 lg:mt-12 relative z-10 mb-2 text-center md:text-left">
            <div className="order-2 md:order-1">
              © 2026 <span className="serif-italic normal-case tracking-normal text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px]">CodeBazaar</span>. ALL RIGHTS RESERVED.
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 order-1 md:order-2">
              <a href="#projects" className="hover:text-white transition-colors">Terms & Conditions</a>
              <a href="#projects" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>

          {/* Huge Footer Text */}
          <div className="w-full flex justify-center items-end mt-8 sm:mt-12 md:mt-16 rounded-b-[24px] pb-4 sm:pb-8 px-4">
            <span className="serif-italic normal-case tracking-normal text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/20 text-[13vw] sm:text-[14vw] md:text-[14.5vw] leading-[0.8] select-none whitespace-nowrap pr-[2vw]">
              CodeBazaar
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
