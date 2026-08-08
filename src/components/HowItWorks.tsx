import { Layers, Lock, UserCheck, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Select Product',
    desc: 'Browse our catalog of verified templates and select the codebase that fits your tech stack and project needs.',
    linkText: 'EXPLORE PRODUCTS',
    icon: Layers,
    colorTheme: 'blue'
  },
  {
    num: '2',
    title: 'Pay Securely',
    desc: 'Complete checkout securely via our payment options. Payments are protected and keys are instantly provisioned.',
    linkText: 'SECURE PAYMENT',
    icon: Lock,
    colorTheme: 'purple'
  },
  {
    num: '3',
    title: 'My Orders',
    desc: 'Once payment succeeds, your license and code project is immediately listed in the "My Orders" tab of your dashboard.',
    linkText: 'VIEW MY ORDERS',
    icon: UserCheck,
    colorTheme: 'purple'
  },
  {
    num: '4',
    title: 'Download the File',
    desc: 'Download the complete template ZIP archive, setup guide, and documentation anytime to build your application.',
    linkText: 'DOWNLOAD ZIP',
    icon: Download,
    colorTheme: 'emerald'
  }
];

const themeStyles = {
  blue: {
    iconClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    badgeClass: 'bg-blue-500',
    linkClass: 'text-blue-400 group-hover:text-blue-300'
  },
  purple: {
    iconClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    badgeClass: 'bg-purple-500',
    linkClass: 'text-purple-400 group-hover:text-purple-300'
  },
  emerald: {
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    badgeClass: 'bg-emerald-500',
    linkClass: 'text-emerald-400 group-hover:text-emerald-300'
  }
};

export default function HowItWorks() {
  return (
    <section id="how-to-get-code" className="py-24 px-6 relative z-10 bg-[#020316] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-sm uppercase tracking-widest font-bold font-mono text-purple-400 mb-2">
            Simple Workflow
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            How to Get Your Purchased Code
          </h3>
          <p className="max-w-[600px] mx-auto text-lg text-white/60">
            Get access to premium code configurations in four straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-emerald-500/20 z-0">
            {/* Animated glow on the line */}
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[pan_3s_linear_infinite]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const theme = themeStyles[step.colorTheme as keyof typeof themeStyles];

              return (
                <div 
                  key={index}
                  className="flex flex-col p-8 bg-[#0c0d1e]/80 backdrop-blur-xl border border-white/10 rounded-[28px] hover:border-white/20 hover:bg-[#121326]/80 transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative ${theme.bgClass} shadow-inner`}>
                    <Icon className={`w-8 h-8 ${theme.iconClass}`} />
                    
                    <div className={`absolute -top-3 -right-3 w-7 h-7 rounded-full ${theme.badgeClass} text-white text-sm font-bold flex items-center justify-center border-[3px] border-[#0c0d1e] shadow-md group-hover:scale-110 transition-transform`}>
                      {step.num}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h4>
                  
                  <p className="text-white/60 text-sm leading-relaxed mb-8 flex-1">
                    {step.desc}
                  </p>
                  
                  <button className={`flex items-center text-sm font-bold uppercase tracking-wider mt-auto ${theme.linkClass} transition-colors`}>
                    {step.linkText}
                    {step.linkText !== 'SECURE PAYMENT' && (
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </section>
  );
}
