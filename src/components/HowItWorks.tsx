import { useRef, useEffect } from 'react';
import { UserCheck, CreditCard, FolderArchive } from 'lucide-react';

export default function HowItWorks() {
  const pipelineRef = useRef<HTMLDivElement>(null);
  const leftNodeRef = useRef<HTMLDivElement>(null);
  const centerNodeRef = useRef<HTMLDivElement>(null);
  const rightNodeRef = useRef<HTMLDivElement>(null);
  const beamGlowRef = useRef<SVGPathElement>(null);
  const beamCoreRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pipeline = pipelineRef.current;
    const leftNode = leftNodeRef.current;
    const centerNode = centerNodeRef.current;
    const rightNode = rightNodeRef.current;
    const glowPath = beamGlowRef.current;
    const corePath = beamCoreRef.current;
    const gradient = gradientRef.current;
    const splash = splashRef.current;

    if (!pipeline || !leftNode || !centerNode || !rightNode || !glowPath || !corePath || !gradient || !splash) return;

    // Recalculate SVG path
    const updatePath = () => {
      const pRect = pipeline.getBoundingClientRect();
      const leftRect = leftNode.getBoundingClientRect();
      const centerRect = centerNode.getBoundingClientRect();
      const rightRect = rightNode.getBoundingClientRect();

      const startX = leftRect.left + leftRect.width / 2 - pRect.left;
      const startY = leftRect.top + leftRect.height / 2 - pRect.top;
      const midX = centerRect.left + centerRect.width / 2 - pRect.left;
      const midY = centerRect.top + centerRect.height / 2 - pRect.top;
      const endX = rightRect.left + rightRect.width / 2 - pRect.left;
      const endY = rightRect.top + rightRect.height / 2 - pRect.top;

      const pathData = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      glowPath.setAttribute('d', pathData);
      corePath.setAttribute('d', pathData);
    };

    updatePath();
    window.addEventListener('resize', updatePath);

    // Animation Loop State Machine
    let animationFrameId: number;
    let lastStateChange = performance.now();
    let state: 'p1' | 'splash' | 'p2' | 'idle' = 'p1';

    // Beam SVG gradient update inside requestAnimationFrame loop
    const animate = (now: number) => {
      const elapsed = now - lastStateChange;
      const gradient = gradientRef.current;
      const glowPath = beamGlowRef.current;
      const corePath = beamCoreRef.current;

      if (!pipeline || !leftNode || !centerNode || !rightNode || !glowPath || !corePath || !gradient || !splash) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (state === 'p1') {
        // Phase 1: Left Node -> Center Node (0% to 50%)
        const t = Math.min(1, elapsed / 800);
        const percentage = t * 0.5;
        const center = percentage * 100;

        // Manage beam opacity
        glowPath.style.opacity = '0.6';
        corePath.style.opacity = '1';

        if (gradient) {
          gradient.setAttribute('x1', `${center - 5}%`);
          gradient.setAttribute('x2', `${center + 5}%`);
        }

        // Node 1 active state
        if (t < 0.8) {
          leftNode.classList.add('active');
        } else {
          leftNode.classList.remove('active');
        }

        if (t >= 1) {
          // Transition to splash
          state = 'splash';
          lastStateChange = now;
          glowPath.style.opacity = '0';
          corePath.style.opacity = '0';
          splash.classList.add('animate');
        }
      } else if (state === 'splash') {
        const duration = 800;
        const progress = Math.min(1, elapsed / duration);

        if (progress >= 1) {
          // Transition to p2
          state = 'p2';
          lastStateChange = now;
          splash.classList.remove('animate');
          glowPath.style.opacity = '0.6';
          corePath.style.opacity = '1';
        }
      } else if (state === 'p2') {
        // Phase 2: Center Node -> Right Node (50% to 100%)
        const t = Math.min(1, elapsed / 800);
        const percentage = 0.5 + t * 0.5;
        const center = percentage * 100;

        if (gradient) {
          gradient.setAttribute('x1', `${center - 5}%`);
          gradient.setAttribute('x2', `${center + 5}%`);
        }

        // Node 3 active state
        if (t > 0.2) {
          rightNode.classList.add('active');
        } else {
          rightNode.classList.remove('active');
        }

        if (t >= 1) {
          // Transition to idle
          rightNode.classList.remove('active');
          state = 'idle';
          lastStateChange = now;
          glowPath.style.opacity = '0';
          corePath.style.opacity = '0';
        }
      } else if (state === 'idle') {
        const duration = 1000;
        const progress = Math.min(1, elapsed / duration);

        if (progress >= 1) {
          // Reset loop to p1
          state = 'p1';
          lastStateChange = now;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updatePath);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Select Template & Authenticate',
      desc: 'Browse our collection of highly curated boilerplate codebase configurations. Sign in or register to bind the codebase purchase license to your profile.',
      icon: <UserCheck className="w-6 h-6 text-purple-400" />
    },
    {
      num: '02',
      title: 'Submit Micro-Payment of ₹50',
      desc: 'Process the flat rupee transaction securely. Our system utilizes the Razorpay gateway to handle card, net banking, wallets, and UPI payments instantly.',
      icon: <CreditCard className="w-6 h-6 text-pink-400" />
    },
    {
      num: '03',
      title: 'Extract & Run Your Files',
      desc: 'Once payment confirms, your item unlocks. Get immediate access to your code in ZIP format. Extract, open, run npm install, and kickstart your next build.',
      icon: <FolderArchive className="w-6 h-6 text-teal-400" />
    }
  ];

  return (
    <section id="how-to-get-code" className="py-24 px-6 relative z-10 bg-[#0a0a0f] overflow-hidden hero-card">
      {/* Dynamic Scoped Styles */}
      <style>{`
        /* =========================================================
           CODEBAZAAR HERO BACKGROUND (UPSIDE DOWN FLIPPED)
           Soft Lavender → Violet → Indigo → Dark Navy
           ========================================================= */

        /* 1. Main atmospheric gradient */
        .hero-card::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            /* Soft lavender glow at the very top (flipped) */
            radial-gradient(
              ellipse 100% 45% at 50% -10%,
              rgba(190, 165, 255, 0.95) 0%,
              rgba(145, 105, 255, 0.82) 20%,
              rgba(105, 55, 245, 0.72) 40%,
              transparent 72%
            ),

            /* Main purple atmospheric glow at the top (flipped) */
            radial-gradient(
              ellipse 90% 55% at 50% 15%,
              rgba(92, 42, 235, 0.95) 0%,
              rgba(67, 30, 180, 0.85) 35%,
              rgba(35, 20, 105, 0.75) 62%,
              transparent 82%
            ),

            /* Deep indigo transition at the top (flipped) */
            radial-gradient(
              ellipse 120% 70% at 50% 30%,
              rgba(35, 20, 105, 0.9) 0%,
              rgba(20, 14, 70, 0.88) 45%,
              transparent 78%
            ),

            /* Very subtle blue-violet atmospheric light at the top (flipped) */
            radial-gradient(
              ellipse 80% 50% at 85% 25%,
              rgba(82, 48, 220, 0.35) 0%,
              transparent 70%
            ),

            /* Base dark navy (flipped to 0deg) */
            linear-gradient(
              0deg,
              #01020F 0%,
              #02031A 24%,
              #08062C 48%,
              #17105A 68%,
              #3B1FC4 84%,
              #8F6DFF 100%
            );

          z-index: 0;
          pointer-events: none;

          /* Very subtle atmospheric movement */
          animation: codebazaar-atmosphere 14s ease-in-out infinite alternate;
        }


        /* =========================================================
           2. Extremely subtle atmospheric animation
           ========================================================= */

        @keyframes codebazaar-atmosphere {
          0% {
            opacity: 0.96;
            transform: scale(1);
            filter: brightness(0.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.015);
            filter: brightness(1);
          }

          100% {
            opacity: 0.98;
            transform: scale(1.025);
            filter: brightness(1.04);
          }
        }


        /* =========================================================
           3. Optional soft ambient light layer
           Adds the smooth glowing purple area near the top (flipped)
           ========================================================= */

        .hero-card::after {
          content: "";
          position: absolute;
          left: -10%;
          right: -10%;
          top: -20%;

          height: 55%;

          background:
            radial-gradient(
              ellipse at center,
              rgba(116, 67, 255, 0.65) 0%,
              rgba(89, 42, 225, 0.45) 32%,
              rgba(62, 30, 175, 0.2) 55%,
              transparent 75%
            );

          filter: blur(45px);

          opacity: 0.75;

          z-index: 0;
          pointer-events: none;

          animation: top-purple-glow 10s ease-in-out infinite alternate;
        }


        @keyframes top-purple-glow {
          0% {
            transform: translateX(-2%) scale(0.98);
            opacity: 0.65;
          }

          100% {
            transform: translateX(2%) scale(1.03);
            opacity: 0.82;
          }
        }


        /* =========================================================
           4. MOVING CROSSHATCH GRID (CHAKS) LINES
           ========================================================= */

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 80%);
          z-index: 0;
          pointer-events: none;
          animation: grid-move 15s linear infinite;
        }

        @keyframes grid-move {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }


        /* =========================================================
           5. Splash (re-enabled for beam animation)
           ========================================================= */

        .splash {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          transform: translate(-50%, -50%) scale(0.4);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          z-index: 2;
        }


        /* =========================================================
           6. Keep hero content above the background
           ========================================================= */

        .hero-card > * {
          position: relative;
          z-index: 1;
        }
        .hero-card > .absolute {
          position: absolute;
        }


        /* =========================================================
           7. Prevent background animation from affecting content
           ========================================================= */

        .hero-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        /* Pipeline styling */
        .icon-pipeline {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 700px;
          margin: 0 auto 64px;
          z-index: 1;
        }

        .beam-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
          z-index: 2;
        }

        .pipeline-line {
          width: 160px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07));
        }
        .pipeline-line.right {
          background: linear-gradient(270deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07));
        }

        .icon-node {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #1a1a24;
          cursor: pointer;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow:
            6px 6px 12px rgba(0,0,0,0.4),
            -4px -4px 10px rgba(255,255,255,0.03),
            inset 1px 1px 1px rgba(255,255,255,0.05),
            inset 4px 4px 8px rgba(0,0,0,0.4);
        }

        .icon-node::after {
          content: '';
          position: absolute;
          inset: -7px;
          border: 1px dotted rgba(168, 85, 247, 0.4);
          border-radius: 50%;
          pointer-events: none;
          animation: rotate-ring 12s linear infinite, border-color-shift 6s ease-in-out infinite alternate;
        }

        .icon-node:hover {
          transform: translateY(-1px);
          box-shadow:
            8px 8px 16px rgba(0,0,0,0.5),
            -5px -5px 12px rgba(255,255,255,0.04);
        }

        .icon-node-center {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #1e1e2c;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            8px 8px 16px rgba(0,0,0,0.5),
            -6px -6px 14px rgba(255,255,255,0.04),
            inset 1px 1px 2px rgba(255,255,255,0.06),
            inset 6px 6px 12px rgba(0,0,0,0.5);
        }

        .icon-node-center::after {
          content: '';
          position: absolute;
          inset: -9px;
          border: 1px dotted rgba(236, 72, 153, 0.5);
          border-radius: 50%;
          pointer-events: none;
          animation: rotate-ring-reverse 15s linear infinite, border-color-shift 6s ease-in-out infinite alternate;
        }

        /* Dynamic Color Shift Animations */
        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotate-ring-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes border-color-shift {
          0% { border-color: rgba(168, 85, 247, 0.5); }
          50% { border-color: rgba(236, 72, 153, 0.6); }
          100% { border-color: rgba(99, 102, 241, 0.5); }
        }

        .beam-stop-start {
          animation: color-shift-pink 6s ease-in-out infinite alternate;
        }
        .beam-stop-end {
          animation: color-shift-purple 6s ease-in-out infinite alternate;
        }

        @keyframes color-shift-pink {
          0% { stop-color: #db2777; }
          50% { stop-color: #ec4899; }
          100% { stop-color: #3b82f6; }
        }

        @keyframes color-shift-purple {
          0% { stop-color: #c084fc; }
          50% { stop-color: #a855f7; }
          100% { stop-color: #6366f1; }
        }

        /* Side Node Glows */
        .icon-node::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 4;
        }

        .node-light-right::before {
          background: radial-gradient(circle at right, rgba(200, 200, 200, 0.45) 0%, transparent 70%);
        }

        .node-light-left::before {
          background: radial-gradient(circle at left, rgba(168, 85, 247, 0.5) 0%, transparent 70%);
        }

        .icon-node.active::before {
          opacity: 1;
        }

        .splash {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          transform: translate(-50%, -50%) scale(0.4);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          z-index: 2;
          animation: splash-color-shift 6s ease-in-out infinite alternate;
        }

        .splash.animate {
          animation: splash-anim 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards, splash-color-shift 6s ease-in-out infinite alternate;
        }

        @keyframes splash-color-shift {
          0% { background: radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%); }
          50% { background: radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%); }
          100% { background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%); }
        }

        @keyframes splash-anim {
          0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.8; }
          40%  { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }

        @media (max-width: 860px) {
          .icon-pipeline {
            gap: 0;
            margin-top: 40px;
          }
          .pipeline-line {
            width: 80px;
          }
        }

        @media (max-width: 768px) {
          .icon-node {
            width: 38px;
            height: 38px;
          }
          .icon-node-center {
            width: 52px;
            height: 52px;
          }
      `}</style>

      {/* Animated crosshatch chaks grid background layer */}
      <div className="hero-grid" aria-hidden="true" />

      {/* ── Top section blend ─────────────────────────────────────────────
          Picks up the hero image's warm violet/purple at the boundary and
          flows smoothly into the section's own atmospheric background.
          NO black — pure colour continuity.
      ──────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '260px',
          zIndex: 25,
          background: `linear-gradient(
            to bottom,
            rgba(105, 45, 210, 0.92)  0%,
            rgba(90,  35, 195, 0.78) 18%,
            rgba(70,  25, 175, 0.58) 36%,
            rgba(50,  18, 145, 0.36) 55%,
            rgba(30,  12, 100, 0.14) 74%,
            transparent              100%
          )`,
        }}
      />

      {/* Glowing Neon Gradient Divider Line matching both sections (Subtle) */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/50 via-purple-500/50 via-pink-500/50 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)] z-20 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold font-mono" style={{ color: '#1a1a2e' }}>Simple Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-bold mt-2" style={{ color: '#000000' }}>How to Get Your Purchased Code</h3>
          <p className="max-w-[600px] mx-auto mt-4 text-base" style={{ color: '#1c1c2e' }}>
            Get access to premium code configurations in three straightforward steps.
          </p>
        </div>

        {/* Animated Icon Pipeline Centerpiece (Moved after title) */}
        <div className="icon-pipeline" ref={pipelineRef}>
          <svg className="beam-svg">
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" />
              <feComposite in="SourceGraphic" operator="over" />
            </filter>
            <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse" ref={gradientRef}>
              <stop offset="0%" className="beam-stop-start" stopColor="#db2777" stopOpacity="0" />
              <stop offset="20%" className="beam-stop-start" stopColor="#db2777" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="80%" className="beam-stop-end" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" className="beam-stop-end" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
            <path ref={beamGlowRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="3" filter="url(#glow)" style={{ opacity: 0 }} />
            <path ref={beamCoreRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="1" style={{ opacity: 0 }} />
          </svg>

          {/* Left Node: Authenticate */}
          <div className="icon-node node-light-right" ref={leftNodeRef}>
            <UserCheck className="w-5 h-5 text-purple-400 relative z-10" />
          </div>

          <div className="pipeline-line" />

          {/* Center Wrapper: Micro-Payment */}
          <div className="relative">
            <div className="splash" ref={splashRef} />
            <div className="icon-node-center" ref={centerNodeRef}>
              <CreditCard className="w-6 h-6 text-pink-400 relative z-10" />
            </div>
          </div>

          <div className="pipeline-line right" />

          {/* Right Node: Extract & Run */}
          <div className="icon-node node-light-left" ref={rightNodeRef}>
            <FolderArchive className="w-5 h-5 text-teal-400 relative z-10" />
          </div>
        </div>

        {/* Steps Grid (Moved to down side of centerpiece animation) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-12">
          {steps.map((step) => (
            <div 
              key={step.num}
              className="relative p-8 bg-white/[0.02] border border-white/10 rounded-[32px] hover:border-white/20 transition-all flex flex-col"
            >
              {/* Top Row with icon and step number */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-mono text-2xl font-bold text-white/25">{step.num}</span>
              </div>

              {/* Title & Description */}
              <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
              <p className="text-white/60 text-sm leading-relaxed flex-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
