export default function Footer() {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#020316]">
      {/* Background Image in original size/ratio */}
      <img 
        src="https://res.cloudinary.com/dgqd54pbl/image/upload/v1786176344/ChatGPT_Image_Aug_8_2026_01_35_01_PM_ftehcv.png" 
        alt="CodeBazaar Footer" 
        className="w-full h-auto block object-contain select-none pointer-events-none"
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 z-20 font-mono text-white/70 text-[9px] sm:text-[11px] md:text-[13px] lg:text-[14px] tracking-[0.12em] md:tracking-[0.15em] uppercase">
        
        {/* Columns & Socials Grid (Responsive layout matching the reference spacing) */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-8 gap-x-4 text-left pt-24 sm:pt-36 md:pt-48 lg:pt-60">
          {/* Column 1: Products */}
          <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
            <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">Products</h4>
            <ul className="space-y-1.5 sm:space-y-2.5 text-white/60">
              <li><a href="#projects" className="hover:text-white transition-colors">Web Apps</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">UI Kits</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Complete SaaS</a></li>
            </ul>
          </div>

          {/* Column 2: Workflow */}
          <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
            <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">Workflow</h4>
            <ul className="space-y-1.5 sm:space-y-2.5 text-white/60">
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Select & Authenticate</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Submit Micro-Payment</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Extract & Run Files</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-4">
            <h4 className="text-white font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px]">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2.5 text-white/60">
              <li><a href="#projects" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Social Links: Horizontal Row spanning the right side */}
          <div className="col-span-2 md:col-span-6 flex justify-between items-start gap-4 md:gap-0 pt-0 md:pt-[2px] font-bold text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-white">
            <a href="#" className="hover:text-white/60 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white/60 transition-colors">X</a>
            <a href="#" className="hover:text-white/60 transition-colors">Instagram</a>
            <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
          </div>
        </div>

        {/* Bottom copyright & policy row (Suspended exactly above the giant watermark via percentage bottom padding) */}
        <div className="flex items-center justify-between gap-4 pt-4 sm:pt-8 border-t border-white/5 pb-[24%] sm:pb-[20%] md:pb-[18%] lg:pb-[16%]">
          <div className="text-white/40">
            © 2026 CODEBAZAAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-4 sm:gap-8 text-white/40">
            <a href="#projects" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#projects" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
