import { UserCheck, CreditCard, FolderArchive } from 'lucide-react';

export default function HowItWorks() {
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
    <section id="how-to-get-code" className="py-24 px-6 relative z-10 border-t border-white/5 bg-black/20">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-purple-400 font-mono">Simple Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">How to Get Your Purchased Code</h3>
          <p className="text-white/60 max-w-[600px] mx-auto mt-4 text-base">
            Get access to premium code configurations in three straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
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

              {/* Arrow connectors (only shown on desktop/tablet grid) */}
              {idx < 2 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-white/15 font-mono text-xl select-none">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
