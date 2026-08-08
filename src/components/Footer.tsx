export default function Footer() {
  return (
    <footer 
      className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-cover bg-bottom bg-no-repeat bg-[#020316] font-mono text-white/50 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dgqd54pbl/image/upload/v1786176344/ChatGPT_Image_Aug_8_2026_01_35_01_PM_ftehcv.png')"
      }}
    >
      {/* Inner Content Wrapper */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 max-w-[1360px] mx-auto min-h-[380px] sm:min-h-[460px] md:min-h-[520px]">
        
        {/* Top Columns: Product links and Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          {/* Column 1 */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Products</h4>
            <ul className="space-y-2 text-white/40">
              <li><a href="#projects" className="hover:text-white transition-colors">Web Apps</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">UI Kits</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Complete SaaS</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Workflow</h4>
            <ul className="space-y-2 text-white/40">
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Verification</a></li>
              <li><a href="#how-to-get-code" className="hover:text-white transition-colors">Download Code</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Company</h4>
            <ul className="space-y-2 text-white/40">
              <li><a href="#projects" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Connect</h4>
            <ul className="space-y-2 text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">X (Twitter)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & policy row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-16 mt-auto">
          <div className="text-white/40 text-center sm:text-left">
            © 2026 CODEBAZAAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-8 text-white/40 justify-center">
            <a href="#projects" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#projects" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
