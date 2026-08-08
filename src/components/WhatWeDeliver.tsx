import { FileText, Cpu, LayoutTemplate, Zap } from 'lucide-react';

export default function WhatWeDeliver() {
  const offerings = [
    {
      title: 'Structured Codebase & TS Support',
      desc: 'Clean, modular structures built using React and TypeScript. Fully optimized for production builds and lint-free.',
      icon: <Cpu className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Premium CSS & UI Architecture',
      desc: 'Rich aesthetics matching high-end design systems. Fully configured Tailwind configurations, responsive frames, and micro-interactions.',
      icon: <LayoutTemplate className="w-5 h-5 text-pink-400" />
    },
    {
      title: 'Integration Shells & Logic',
      desc: 'Interactive elements, mock states, API routing layouts, and payment checkout shells (like Razorpay/Stripe) pre-wired.',
      icon: <Zap className="w-5 h-5 text-teal-400" />
    },
    {
      title: 'Setup & Customization Docs',
      desc: 'Exhaustive README guidelines. We explain setup scripts, environmental variables, and structural customizations step-by-step.',
      icon: <FileText className="w-5 h-5 text-blue-400" />
    }
  ];

  return (
    <section id="what-we-deliver" className="py-24 px-6 relative z-10 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-purple-400 font-mono">Our Guarantee</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">What We Deliver</h3>
          <p className="text-white/60 max-w-[600px] mx-auto mt-4 text-base">
            Every codebase in the bazaar is packaged to provide an elite launching pad for your project.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offerings.map((item, idx) => (
            <div 
              key={idx}
              className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] hover:border-white/20 transition-all flex items-start gap-6 group"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                {item.icon}
              </div>

              {/* Text */}
              <div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
