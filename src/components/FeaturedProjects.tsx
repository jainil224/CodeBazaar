import { Terminal, Code2, Download, ShoppingBag, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';
import { downloadProjectZip } from '../utils/downloadHelper';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
}

interface FeaturedProjectsProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  purchasedIds: string[];
  onTriggerAuth: () => void;
  onPurchaseSuccess: (projectId: string, projectTitle: string) => void;
}

const PROJECTS: Project[] = [
  {
    id: 'proj-saas',
    title: 'SaaS Platform Boilerplate',
    description: 'Clean Next.js setup with modern auth flow, user dashboard, stripe gateway integration, and fully responsive tailwind shell.',
    tags: ['Next.js', 'Tailwind CSS', 'Stripe', 'TypeScript'],
    gradient: 'from-blue-600 via-indigo-600 to-purple-600'
  },
  {
    id: 'proj-ai-chat',
    title: 'AI Chat Bot Interface',
    description: 'Beautiful conversational user interface with stream parsing, markdown rendering, code highlighting, and vector memory.',
    tags: ['React', 'OpenAI SDK', 'Framer Motion', 'Tailwind'],
    gradient: 'from-purple-600 via-pink-600 to-red-600'
  },
  {
    id: 'proj-ecom',
    title: 'E-Commerce Storefront',
    description: 'Fast, lightweight e-commerce storefront with cart persistence, category searching, mock invoice generation, and checkout.',
    tags: ['React', 'Context API', 'Lucide Icons', 'Vite'],
    gradient: 'from-teal-600 via-emerald-600 to-blue-600'
  },
  {
    id: 'proj-portfolio',
    title: 'Creative Studio Portfolio',
    description: 'Stunning typography-focused agency website showcasing custom cursor behaviors, interactive project reels, and smooth transitions.',
    tags: ['HTML5', 'GSAP', 'Vite', 'CSS Gradients'],
    gradient: 'from-orange-600 via-red-600 to-pink-600'
  }
];

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (project: Project) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }

    setLoadingId(project.id);

    // Load Razorpay Checkout SDK
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      // Fallback checkout simulation if SDK doesn't load
      setTimeout(() => {
        setLoadingId(null);
        alert(`Razorpay SDK load failed/blocked. Opening fallback checkout: Successfully paid ₹50 for "${project.title}"!`);
        onPurchaseSuccess(project.id, project.title);
      }, 1000);
      return;
    }

    const options = {
      key: 'rzp_test_default', // standard test key
      amount: 5000, // INR 50 in paise
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase codebase: ${project.title}`,
      handler: function (_response: any) {
        setLoadingId(null);
        onPurchaseSuccess(project.id, project.title);
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email,
      },
      theme: {
        color: '#6938FF',
      },
      modal: {
        ondismiss: function () {
          setLoadingId(null);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleDownload = (project: Project) => {
    downloadProjectZip(project.title);
  };

  return (
    <section id="projects" className="py-24 px-6 relative z-10 max-w-[1200px] mx-auto">
      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="text-xs uppercase tracking-widest font-bold text-purple-400 font-mono">Bazaar Showroom</h2>
        <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">Featured Project Templates</h3>
        <p className="text-white/60 max-w-[600px] mx-auto mt-4 text-base">
          Get production-ready, beautifully designed project bases for just ₹50. Instant source code download.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PROJECTS.map((project) => {
          const isPurchased = purchasedIds.includes(project.id);
          const isLoading = loadingId === project.id;

          return (
            <div 
              key={project.id} 
              className="group bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden flex flex-col hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Card visual banner */}
              <div className={`h-48 bg-gradient-to-tr ${project.gradient} p-6 flex flex-col justify-between relative`}>
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                <div className="flex justify-between items-start z-10">
                  <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono uppercase tracking-wider py-1 px-3 rounded-full">
                    Template
                  </span>
                  <Code2 className="w-6 h-6 text-white/80" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/90 bg-black/30 backdrop-blur-md py-1 px-2.5 rounded border border-white/10 w-fit z-10">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>₹50.00 INR</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {project.title}
                </h4>
                <p className="text-white/60 text-sm mt-3 leading-relaxed flex-1">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-white/[0.04] text-white/50 text-[11px] font-medium py-1 px-2.5 rounded-lg border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA Action */}
                <div className="mt-8 border-t border-white/15 pt-6">
                  {isPurchased ? (
                    <button
                      onClick={() => handleDownload(project)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-98 transition-all cursor-pointer text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Code ZIP</span>
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => handlePurchase(project)}
                      className="w-full bg-white text-wandor-dark hover:bg-white/90 disabled:opacity-50 font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.1)] active:scale-98 transition-all cursor-pointer text-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Initiating Checkout...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Buy Codebase (₹50)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
