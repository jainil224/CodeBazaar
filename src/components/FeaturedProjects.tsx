import { Code2, Download, Loader2, Eye, Layers, Zap, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';
import { downloadProjectZip } from '../utils/downloadHelper';
import PaymentSuccessModal from './PaymentSuccessModal';
import ProjectPreviewModal, { type ProjectDetail } from './ProjectPreviewModal';

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
  detail: ProjectDetail;
}

interface FeaturedProjectsProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  purchasedIds: string[];
  onTriggerAuth: () => void;
  onPurchaseSuccess: (projectId: string, projectTitle: string, paymentId?: string) => void;
}

const PROJECTS: Project[] = [
  {
    id: 'proj-codebazaar-ui',
    title: 'CodeBazaar Marketplace UI',
    description: 'Full marketplace landing page with animated hero, glassmorphism project cards, Razorpay checkout, Firebase auth, and admin dashboard.',
    tags: ['React', 'TypeScript', 'Firebase', 'Razorpay', 'Framer Motion', 'Tailwind'],
    price: '₹50',
    glassMediaBg: 'bg-violet-500/15 border-violet-400/20',
    glassAccentBg: 'bg-violet-600/40 border-violet-400/30',
    glassTagBg: 'bg-violet-500/10 border-violet-400/20',
    imageUrl: 'https://res.cloudinary.com/dgqd54pbl/image/upload/v1786349531/Screenshot_2026-08-10_134050_hovkve.png',
    detail: {
      id: 'proj-codebazaar-ui',
      title: 'CodeBazaar Marketplace UI',
      price: '₹50',
      description: 'Full marketplace landing page with animated hero, glassmorphism project cards, Razorpay checkout, Firebase auth, and admin dashboard.',
      longDescription:
        'A complete, production-ready code marketplace platform built with React 19 and TypeScript. Features a stunning dark glassmorphism UI with animated gradient backgrounds, a full Firebase authentication system (email + Google OAuth), Razorpay live payment gateway, real-time Firestore transaction tracking, and a full admin dashboard. Includes smooth Framer Motion animations, responsive design, and an SEO-optimized structure. Everything you need to launch your own code-selling marketplace from day one.',
      imageUrl: 'https://res.cloudinary.com/dgqd54pbl/image/upload/v1786349531/Screenshot_2026-08-10_134050_hovkve.png',
      tags: ['React 19', 'TypeScript', 'Firebase', 'Razorpay', 'Framer Motion', 'Tailwind CSS', 'Vite', 'Firestore'],
      techStack: [
        { category: 'Frontend', color: '#a78bfa', items: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion'] },
        { category: 'Backend / BaaS', color: '#fb923c', items: ['Firebase Auth', 'Firestore', 'Firebase Security Rules'] },
        { category: 'Payments', color: '#34d399', items: ['Razorpay Checkout SDK', 'Live & Test Keys'] },
        { category: 'Build Tools', color: '#60a5fa', items: ['Vite 8', 'oxlint', 'PostCSS'] },
      ],
      features: [
        'Animated hero section with 3D gradient background',
        'Firebase Email + Google OAuth authentication',
        'Razorpay payment gateway (live-ready)',
        'Firestore real-time transaction logging',
        'Admin dashboard with purchase history',
        'Glassmorphism project cards with hover effects',
        'Payment success modal with copy-able payment ID',
        'Instant ZIP source code download after purchase',
        'Fully responsive — mobile, tablet & desktop',
        'SEO meta tags & semantic HTML structure',
      ],
      highlights: [
        { icon: <Layers className="w-5 h-5" />, label: 'Components', value: '15+', color: '#a78bfa' },
        { icon: <Zap className="w-5 h-5" />, label: 'Build Time', value: '< 1s', color: '#fbbf24' },
        { icon: <Shield className="w-5 h-5" />, label: 'Auth', value: 'Firebase', color: '#fb923c' },
        { icon: <Smartphone className="w-5 h-5" />, label: 'Responsive', value: '100%', color: '#34d399' },
      ],
    },
  },
  {
    id: 'proj-saas',
    title: 'SaaS Platform Boilerplate',
    description: 'Clean Next.js setup with modern auth flow, user dashboard, stripe gateway integration, and fully responsive tailwind shell.',
    tags: ['Next.js', 'Tailwind', 'Stripe', 'TypeScript'],
    price: '₹50',
    glassMediaBg: 'bg-emerald-500/15 border-emerald-400/20',
    glassAccentBg: 'bg-emerald-600/40 border-emerald-400/30',
    glassTagBg: 'bg-emerald-500/10 border-emerald-400/20',
    imageUrl: '',
    detail: {
      id: 'proj-saas',
      title: 'SaaS Platform Boilerplate',
      price: '₹50',
      description: 'Clean Next.js setup with modern auth flow, user dashboard, stripe gateway integration, and fully responsive tailwind shell.',
      longDescription:
        'A production-ready SaaS starter kit built with Next.js 14 App Router. Comes with a complete authentication system, Stripe subscription billing, user dashboard, settings page, and a beautifully designed landing page. Skip months of boilerplate work and ship your SaaS product faster.',
      imageUrl: '',
      tags: ['Next.js', 'Tailwind', 'Stripe', 'TypeScript'],
      techStack: [
        { category: 'Frontend', color: '#34d399', items: ['Next.js 14', 'TypeScript', 'Tailwind CSS'] },
        { category: 'Payments', color: '#818cf8', items: ['Stripe', 'Webhooks', 'Subscriptions'] },
        { category: 'Database', color: '#fb923c', items: ['Prisma ORM', 'PostgreSQL'] },
      ],
      features: [
        'Next.js 14 App Router with server components',
        'Stripe subscription billing & webhooks',
        'User authentication with NextAuth.js',
        'Responsive dashboard & settings pages',
        'Prisma ORM + PostgreSQL database setup',
        'API rate limiting & middleware',
      ],
      highlights: [
        { icon: <Layers className="w-5 h-5" />, label: 'Pages', value: '10+', color: '#34d399' },
        { icon: <Zap className="w-5 h-5" />, label: 'Framework', value: 'Next.js', color: '#a78bfa' },
        { icon: <Shield className="w-5 h-5" />, label: 'Payments', value: 'Stripe', color: '#818cf8' },
        { icon: <Smartphone className="w-5 h-5" />, label: 'Responsive', value: '100%', color: '#34d399' },
      ],
    },
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
    imageUrl: '',
    detail: {
      id: 'proj-ai-chat',
      title: 'AI Chat Bot Interface',
      price: '₹50',
      description: 'Beautiful conversational user interface with stream parsing, markdown rendering, code highlighting, and vector memory.',
      longDescription:
        'A stunning AI chat interface with streaming responses, markdown rendering, syntax-highlighted code blocks, and conversation memory. Built for OpenAI-compatible APIs. Customize the system prompt, model, and temperature from a clean settings panel.',
      imageUrl: '',
      tags: ['React', 'OpenAI', 'Framer Motion', 'Tailwind'],
      techStack: [
        { category: 'Frontend', color: '#fbbf24', items: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'] },
        { category: 'AI', color: '#a78bfa', items: ['OpenAI API', 'Stream Parsing', 'Vector Memory'] },
        { category: 'Rendering', color: '#34d399', items: ['React Markdown', 'Prism.js'] },
      ],
      features: [
        'Real-time streaming token response',
        'Markdown & code block rendering',
        'Syntax highlighting for 20+ languages',
        'Conversation history & memory',
        'Configurable system prompt & model',
        'Smooth Framer Motion animations',
      ],
      highlights: [
        { icon: <Zap className="w-5 h-5" />, label: 'Streaming', value: 'Real-time', color: '#fbbf24' },
        { icon: <Layers className="w-5 h-5" />, label: 'AI Model', value: 'OpenAI', color: '#a78bfa' },
        { icon: <Shield className="w-5 h-5" />, label: 'Memory', value: 'Vector', color: '#34d399' },
        { icon: <Smartphone className="w-5 h-5" />, label: 'Responsive', value: '100%', color: '#60a5fa' },
      ],
    },
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
    imageUrl: '',
    detail: {
      id: 'proj-ecom',
      title: 'E-Commerce Storefront',
      price: '₹50',
      description: 'Fast, lightweight e-commerce storefront with cart persistence, category searching, mock invoice generation, and checkout.',
      longDescription:
        'A fast, lightweight e-commerce storefront built with React and Vite. Features a product grid, category filters, search, persistent cart using localStorage, and a full checkout flow with mock invoice PDF generation. No backend required — works entirely client-side.',
      imageUrl: '',
      tags: ['React', 'Context API', 'Lucide Icons', 'Vite'],
      techStack: [
        { category: 'Frontend', color: '#22d3ee', items: ['React', 'TypeScript', 'Context API', 'Vite'] },
        { category: 'State', color: '#60a5fa', items: ['React Context', 'localStorage'] },
        { category: 'UI', color: '#f472b6', items: ['Lucide Icons', 'Vanilla CSS'] },
      ],
      features: [
        'Product grid with category filters',
        'Real-time search across products',
        'Persistent cart with localStorage',
        'Checkout flow with order summary',
        'Mock invoice & receipt generation',
        'Fully client-side — no backend needed',
      ],
      highlights: [
        { icon: <Zap className="w-5 h-5" />, label: 'Framework', value: 'Vite', color: '#22d3ee' },
        { icon: <Layers className="w-5 h-5" />, label: 'Products', value: '50+', color: '#60a5fa' },
        { icon: <Shield className="w-5 h-5" />, label: 'Backend', value: 'None', color: '#34d399' },
        { icon: <Smartphone className="w-5 h-5" />, label: 'Responsive', value: '100%', color: '#f472b6' },
      ],
    },
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
    imageUrl: '',
    detail: {
      id: 'proj-portfolio',
      title: 'Creative Studio Portfolio',
      price: '₹50',
      description: 'Stunning typography-focused agency website showcasing custom cursor behaviors, interactive project reels, and smooth transitions.',
      longDescription:
        'A jaw-dropping creative agency portfolio site with custom cursor, smooth GSAP scroll animations, horizontal project reel, magnetic button effects, and a dark, cinematic aesthetic. Built with plain HTML, CSS, and vanilla JS using Vite for optimal performance.',
      imageUrl: '',
      tags: ['HTML5', 'GSAP', 'Vite', 'CSS Gradients'],
      techStack: [
        { category: 'Core', color: '#f472b6', items: ['HTML5', 'CSS3', 'Vanilla JS'] },
        { category: 'Animation', color: '#a78bfa', items: ['GSAP 3', 'ScrollTrigger', 'Magnetic Effects'] },
        { category: 'Build', color: '#60a5fa', items: ['Vite'] },
      ],
      features: [
        'Custom cursor with magnetic effect',
        'GSAP scroll-triggered animations',
        'Horizontal scrolling project reel',
        'Smooth page transitions',
        'Cinematic dark mode typography',
        'Zero dependencies — pure HTML/CSS/JS',
      ],
      highlights: [
        { icon: <Zap className="w-5 h-5" />, label: 'Animation', value: 'GSAP 3', color: '#a78bfa' },
        { icon: <Layers className="w-5 h-5" />, label: 'Sections', value: '6', color: '#f472b6' },
        { icon: <Shield className="w-5 h-5" />, label: 'Deps', value: 'Zero', color: '#34d399' },
        { icon: <Smartphone className="w-5 h-5" />, label: 'Responsive', value: '100%', color: '#60a5fa' },
      ],
    },
  },
];

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess,
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectDetail | null>(null);
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
      amount: 5000,
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase: ${project.title}`,
      handler: function (response: { razorpay_payment_id: string }) {
        setLoadingId(null);
        onPurchaseSuccess(project.id, project.title, response.razorpay_payment_id);
        setPreviewProject(null); // close preview if open
        setSuccessModal({
          open: true,
          projectId: project.id,
          projectTitle: project.title,
          paymentId: response.razorpay_payment_id,
          amount: 50,
        });
      },
      prefill: { name: currentUser.name, email: currentUser.email },
      notes: { project_id: project.id, project_title: project.title },
      theme: { color: '#6938FF' },
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
                  {/* Media / Visual Box — clickable to open preview */}
                  <div
                    className={`relative w-full h-[260px] sm:h-[280px] rounded-[28px] overflow-hidden ${project.glassMediaBg} backdrop-blur-md border flex flex-col justify-between p-4 cursor-pointer`}
                    onClick={() => setPreviewProject(project.detail)}
                    title="Click to preview"
                  >
                    {/* Price Tag */}
                    <div className="absolute top-0 right-0 bg-white/15 backdrop-blur-2xl border-b border-l border-white/25 text-white font-bold text-lg sm:text-xl px-5 py-2 rounded-bl-[22px] z-10 flex items-center justify-center shadow-sm">
                      {project.price}
                    </div>

                    {/* Preview hint badge */}
                    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                        <Eye className="w-3 h-3" />
                        Click to Preview
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-0 p-2">
                      {project.imageUrl ? (
                        <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-violet-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-white/90" />
                          </div>
                          <span className="text-[11px] font-mono tracking-wider text-white/70 uppercase mt-3 font-bold">
                            Click to Preview
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom accent strip */}
                    <div className={`w-full ${project.glassAccentBg} backdrop-blur-md border text-white/95 text-xs font-semibold py-2.5 px-4 rounded-[18px] text-center tracking-wide shadow-sm z-10`}>
                      Instant Source Code Download
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-5 px-2 pb-2 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <h4
                        className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary-pink transition-colors leading-tight cursor-pointer"
                        onClick={() => setPreviewProject(project.detail)}
                      >
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
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
                            </span>
                          ) : (
                            <span>Order Now ↗</span>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

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

      {/* Project Preview Modal */}
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          isPurchased={purchasedIds.includes(previewProject.id)}
          isLoading={loadingId === previewProject.id}
          onClose={() => setPreviewProject(null)}
          onPurchase={() => {
            const proj = PROJECTS.find(p => p.id === previewProject.id);
            if (proj) handlePurchase(proj);
          }}
          onDownload={() => {
            downloadProjectZip(previewProject.title);
            setPreviewProject(null);
          }}
        />
      )}

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
