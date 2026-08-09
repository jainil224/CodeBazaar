export default function Footer() {
  return (
    <footer 
      className="relative z-10 w-full overflow-hidden -mt-px" 
      style={{
        background: `
          radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.15), transparent 60%),
          linear-gradient(to bottom, #ece0e6 0%, #ded1de 22%, #c9aed9 45%, #a679d1 65%, #7f3fc8 82%, #5a1fb0 100%)
        `
      }}
    >
      {/* Subtle grain/noise overlay */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content Overlay */}
      <div className="relative flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 z-20 font-mono text-white/70 text-[9px] sm:text-[11px] md:text-[13px] lg:text-[14px] tracking-[0.12em] md:tracking-[0.15em] uppercase">
        
        {/* Columns & Socials Grid (Responsive layout matching the reference spacing) */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-8 gap-x-4 text-left pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-24">
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
            <ul className="space-y-1.5 sm:space-y-2.5 text-black font-semibold">
              <li><a href="#projects" className="hover:text-black transition-colors">About CodeBazaar</a></li>
              <li><a href="#projects" className="hover:text-black transition-colors">Our Projects</a></li>
              <li><a href="#faqs" className="hover:text-black transition-colors">FAQ</a></li>
              <li><a href="#projects" className="hover:text-black transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Social Links: Horizontal Row spanning the right side */}
          <div className="col-span-2 md:col-span-6 flex flex-wrap justify-center sm:justify-between items-center gap-6 sm:gap-4 md:gap-0 pt-4 md:pt-[2px] font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-black w-full">
            <a href="#" className="hover:text-black/75 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-black/75 transition-colors">X</a>
            <a href="#" className="hover:text-black/75 transition-colors">Instagram</a>
            <a href="#" className="hover:text-black/75 transition-colors">GitHub</a>
          </div>
        </div>

        {/* Bottom copyright & policy row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 pt-8 sm:pt-10 lg:pt-12 border-t border-black/25 text-black font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] w-full mt-8 sm:mt-10 lg:mt-12 relative z-10 mb-2 text-center md:text-left">
          <div className="order-2 md:order-1">
            © 2026 CODEBAZAAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 order-1 md:order-2">
            <a href="#projects" className="hover:text-black/75 transition-colors">Terms & Conditions</a>
            <a href="#projects" className="hover:text-black/75 transition-colors">Privacy Policy</a>
          </div>
        </div>

        {/* Bottom padding adjustment to ensure footer has breathing room at the bottom */}
        <div className="w-full flex justify-center items-end mt-2">
          <img 
            src="https://res.cloudinary.com/dgqd54pbl/image/upload/v1786209032/ChatGPT_Image_Aug_8_2026_01_35_01_PM_ftehcv-Photoroom_1_yiucxo.png" 
            alt="CodeBazaar Footer Graphic"
            className="w-full h-auto object-cover object-bottom max-h-[400px]"
          />
        </div>
      </div>
    </footer>
  );
}
