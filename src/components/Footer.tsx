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
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 z-20 font-mono text-white/50 text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] tracking-[0.12em] md:tracking-[0.15em] uppercase">
        
        {/* Top Columns: Product links and Navigation */}
        <div className="grid grid-cols-4 gap-4 text-left">
          {/* Column 1 */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-white font-semibold">Products</h4>
            <ul className="space-y-1 sm:space-y-2 text-white/40">
              <li><a href="#projects" className="hover:text-white transition-colors">Web Apps</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">UI Kits</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Complete SaaS</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-white font-semibold">Workflow</h4>
            <ul className="space-y-1 sm:space-y-2 text-white/40">
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Verification</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Download Code</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-white font-semibold">Company</h4>
            <ul className="space-y-1 sm:space-y-2 text-white/40">
              <li><a href="#projects" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-white font-semibold">Connect</h4>
            <ul className="space-y-1 sm:space-y-2 text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">X (Twitter)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
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
