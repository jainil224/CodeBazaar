import { Code2, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';
import { downloadProjectZip } from '../utils/downloadHelper';
import PaymentSuccessModal from './PaymentSuccessModal';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price: string;
  glassMediaBg: string;
  glassAccentBg: string;
  glassTagBg: string;
  imageUrl?: string;
}

interface FeaturedProjectsProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  purchasedIds: string[];
  onTriggerAuth: () => void;
  onPurchaseSuccess: (projectId: string, projectTitle: string, paymentId?: string) => void;
}

const PROJECTS: Project[] = [
  {
    id: 'proj-saas',
    title: 'SaaS Platform Boilerplate',
    description: 'Clean Next.js setup with modern auth flow, user dashboard, stripe gateway integration, and fully responsive tailwind shell.',
    tags: ['Next.js', 'Tailwind', 'Stripe', 'TypeScript'],
    price: '₹50',
    glassMediaBg: 'bg-emerald-500/15 border-emerald-400/20',
    glassAccentBg: 'bg-emerald-600/40 border-emerald-400/30',
    glassTagBg: 'bg-emerald-500/10 border-emerald-400/20',
    imageUrl: '' // Add your image URL here later
  },
  {
    id: 'proj-ai-chat',
    title: 'AI Chat Bot Interface',
    description: 'Beautiful conversational user interface with stream parsing, markdown rendering, code highlighting, and vector memory.',
    tags: ['React', 'OpenAI', 'Framer Motion', 'Tailwind'],
    price: '₹50',
    glassMediaBg: 'bg-amber-500/15 border-amber-400/20',
    glassAccentBg: 'bg-amber-600/40 border-amber-400/30',
    glassTagBg: 'bg-amber-500/10 border-amber-400/20',
    imageUrl: '' // Add your image URL here later
  },
  {
    id: 'proj-ecom',
    title: 'E-Commerce Storefront',
    description: 'Fast, lightweight e-commerce storefront with cart persistence, category searching, mock invoice generation, and checkout.',
    tags: ['React', 'Context API', 'Lucide Icons', 'Vite'],
    price: '₹50',
    glassMediaBg: 'bg-cyan-500/15 border-cyan-400/20',
    glassAccentBg: 'bg-cyan-600/40 border-cyan-400/30',
    glassTagBg: 'bg-cyan-500/10 border-cyan-400/20',
    imageUrl: '' // Add your image URL here later
  },
  {
    id: 'proj-portfolio',
    title: 'Creative Studio Portfolio',
    description: 'Stunning typography-focused agency website showcasing custom cursor behaviors, interactive project reels, and smooth transitions.',
    tags: ['HTML5', 'GSAP', 'Vite', 'CSS Gradients'],
    price: '₹50',
    glassMediaBg: 'bg-purple-500/15 border-purple-400/20',
    glassAccentBg: 'bg-purple-600/40 border-purple-400/30',
    glassTagBg: 'bg-purple-500/10 border-purple-400/20',
    imageUrl: '' // Add your image URL here later
  }
];

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    projectId: string;
    projectTitle: string;
    paymentId: string;
    amount: number;
  } | null>(null);

  const handlePurchase = async (project: Project) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }

    setLoadingId(project.id);

    // Load Razorpay Checkout SDK
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      setLoadingId(null);
      alert('Unable to connect to Razorpay. Please check your internet connection and try again.');
      return;
    }

    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!RAZORPAY_KEY) {
      setLoadingId(null);
      alert('Razorpay key is not configured. Please contact support.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: 5000, // INR 50 in paise
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase: ${project.title}`,
      image: 'https://i.imgur.com/your-logo.png', // optional logo
      handler: function (response: { razorpay_payment_id: string }) {
        setLoadingId(null);
        // Record purchase in Firestore with real Razorpay payment ID
        onPurchaseSuccess(project.id, project.title, response.razorpay_payment_id);
        // Show beautiful success modal with real payment ID
        setSuccessModal({
          open: true,
          projectId: project.id,
          projectTitle: project.title,
          paymentId: response.razorpay_payment_id,
          amount: 50,
        });
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email,
      },
      notes: {
        project_id: project.id,
        project_title: project.title,
      },
      theme: {
        color: '#6938FF',
      },
      modal: {
        ondismiss: function () {
          setLoadingId(null);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', function (response: { error: { description: string } }) {
      setLoadingId(null);
      alert(`Payment failed: ${response.error.description}. Please try again.`);
    });

    rzp.open();
  };

  const handleDownload = (project: Project) => {
    downloadProjectZip(project.title);
  };

  return (
    <>
    <section id="projects" className="py-24 relative z-10 w-full overflow-hidden bg-transparent">
      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-primary-indigo font-mono">Bazaar Showroom</h2>
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
                className="bg-white/[0.06] backdrop-blur-2xl border border-white/20 rounded-[36px] p-4 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/40 hover:bg-white/[0.09] hover:shadow-[0_25px_60px_rgba(105,56,255,0.25)] transition-all duration-300 group"
              >
                {/* Media / Visual Box */}
                <div className={`relative w-full h-[260px] sm:h-[280px] rounded-[28px] overflow-hidden ${project.glassMediaBg} backdrop-blur-md border flex flex-col justify-between p-4`}>
                  {/* Top Right Price Tag Cutout Badge */}
                  <div className="absolute top-0 right-0 bg-white/15 backdrop-blur-2xl border-b border-l border-white/25 text-white font-bold text-lg sm:text-xl px-5 py-2 rounded-bl-[22px] z-10 flex items-center justify-center shadow-sm">
                    {project.price}
                  </div>

                  {/* Image Area / Placeholder */}
                  <div className="flex-1 flex flex-col items-center justify-center relative z-0 p-4">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover rounded-[20px]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-white/90" />
                        </div>
                        <span className="text-[11px] font-mono tracking-wider text-white/70 uppercase mt-3 font-bold">
                          Project Preview Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Accent Banner Strip */}
                  <div className={`w-full ${project.glassAccentBg} backdrop-blur-md border text-white/95 text-xs font-semibold py-2.5 px-4 rounded-[18px] text-center tracking-wide shadow-sm z-10`}>
                    Instant Source Code Download
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-5 px-2 pb-2 flex flex-col gap-3">
                  {/* Title & Action Link */}
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary-pink transition-colors leading-tight">
                      {project.title}
                    </h4>
                    
                    {isPurchased ? (
                      <button
                        onClick={() => handleDownload(project)}
                        className="underline underline-offset-4 font-bold text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download ↗</span>
                      </button>
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handlePurchase(project)}
                        className="underline underline-offset-4 font-bold text-white hover:text-primary-pink transition-colors text-sm flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</span>
                        ) : (
                          <span>Order Now ↗</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tags Row */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className={`${project.glassTagBg} backdrop-blur-md text-white/90 text-xs font-semibold py-1.5 px-3.5 rounded-full border`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Payment Success Modal */}
    {successModal && (
      <PaymentSuccessModal
        isOpen={successModal.open}
        projectTitle={successModal.projectTitle}
        paymentId={successModal.paymentId}
        amount={successModal.amount}
        onClose={() => setSuccessModal(null)}
        onDownload={() => {
          downloadProjectZip(successModal.projectTitle);
          setSuccessModal(null);
        }}
      />
    )}
    </>
  );
}
