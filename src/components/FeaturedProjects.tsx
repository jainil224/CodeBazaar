import { Code2, Download, Layers, Zap, Shield, Smartphone, Heart, ShoppingBag, ExternalLink } from 'lucide-react';
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
  category: string;
  version: string;
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
    category: 'Landing Page',
    version: 'v2.0.0',
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
        'A complete, production-ready code marketplace platform built with React 19 and TypeScript. Features a stunning dark glassmorphism UI with animated gradient backgrounds, a full Firebase authentication system (email + Google OAuth), Razorpay live payment gateway, real-time Firestore transaction tracking, and a full admin dashboard. Everything you need to launch your own code-selling marketplace from day one.',
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
    category: 'SaaS setup',
    version: 'v1.2.0',
    glassMediaBg: 'bg-emerald-500/15 border-emerald-400/20',
    glassAccentBg: 'bg-emerald-600/40 border-emerald-400/30',
    glassTagBg: 'bg-emerald-500/10 border-emerald-400/20',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    detail: {
      id: 'proj-saas',
      title: 'SaaS Platform Boilerplate',
      price: '₹50',
      description: 'Clean Next.js setup with modern auth flow, user dashboard, stripe gateway integration, and fully responsive tailwind shell.',
      longDescription:
        'A production-ready SaaS starter kit built with Next.js 14 App Router. Comes with a complete authentication system, Stripe subscription billing, user dashboard, settings page, and a beautifully designed landing page. Skip months of boilerplate work and ship your SaaS product faster.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
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
    category: 'AI Interface',
    version: 'v1.1.0',
    glassMediaBg: 'bg-amber-500/15 border-amber-400/20',
    glassAccentBg: 'bg-amber-600/40 border-amber-400/30',
    glassTagBg: 'bg-amber-500/10 border-amber-400/20',
    imageUrl: 'https://images.unsplash.com/photo-1675557009875-436f09780264?auto=format&fit=crop&w=800&q=80',
    detail: {
      id: 'proj-ai-chat',
      title: 'AI Chat Bot Interface',
      price: '₹50',
      description: 'Beautiful conversational user interface with stream parsing, markdown rendering, code highlighting, and vector memory.',
      longDescription:
        'A stunning AI chat interface with streaming responses, markdown rendering, syntax-highlighted code blocks, and conversation memory. Built for OpenAI-compatible APIs. Customize the system prompt, model, and temperature from a clean settings panel.',
      imageUrl: 'https://images.unsplash.com/photo-1675557009875-436f09780264?auto=format&fit=crop&w=800&q=80',
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
    category: 'E-Commerce',
    version: 'v1.0.0',
    glassMediaBg: 'bg-cyan-500/15 border-cyan-400/20',
    glassAccentBg: 'bg-cyan-600/40 border-cyan-400/30',
    glassTagBg: 'bg-cyan-500/10 border-cyan-400/20',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    detail: {
      id: 'proj-ecom',
      title: 'E-Commerce Storefront',
      price: '₹50',
      description: 'Fast, lightweight e-commerce storefront with cart persistence, category searching, mock invoice generation, and checkout.',
      longDescription:
        'A fast, lightweight e-commerce storefront built with React and Vite. Features a product grid, category filters, search, persistent cart using localStorage, and a full checkout flow with mock invoice PDF generation. No backend required — works entirely client-side.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
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
    category: 'Portfolio',
    version: 'v1.0.0',
    glassMediaBg: 'bg-purple-500/15 border-purple-400/20',
    glassAccentBg: 'bg-purple-600/40 border-purple-400/30',
    glassTagBg: 'bg-purple-500/10 border-purple-400/20',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    detail: {
      id: 'proj-portfolio',
      title: 'Creative Studio Portfolio',
      price: '₹50',
      description: 'Stunning typography-focused agency website showcasing custom cursor behaviors, interactive project reels, and smooth transitions.',
      longDescription:
        'A jaw-dropping creative agency portfolio site with custom cursor, smooth GSAP scroll animations, horizontal project reel, magnetic button effects, and a dark, cinematic aesthetic. Built with plain HTML, CSS, and vanilla JS using Vite for optimal performance.',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
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

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('codebazaar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleFavorite = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem('codebazaar_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#projects`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(project.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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
        setPreviewProject(null);
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

  const handleDownload = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
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
              const isFavorited = favorites.includes(project.id);
              const isCopied = copiedId === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-white text-zinc-900 rounded-[32px] overflow-hidden flex flex-col justify-between border border-zinc-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(105,56,255,0.15)] hover:border-violet-300 transition-all duration-300 group"
                >
                  {/* Media Box */}
                  <div
                    className="relative w-full h-[240px] sm:h-[265px] overflow-hidden cursor-pointer bg-zinc-50 border-b border-zinc-100 flex items-center justify-center"
                    onClick={() => setPreviewProject(project.detail)}
                  >
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-50 flex flex-col items-center justify-center p-4">
                        <Code2 className="w-12 h-12 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-400 mt-2 font-mono uppercase tracking-wider">Preview Pending</span>
                      </div>
                    )}

                    {/* Floating Heart / Like Button */}
                    <button
                      onClick={(e) => toggleFavorite(project.id, e)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] border border-zinc-100 flex items-center justify-center transition-all duration-200 z-10 hover:scale-105 active:scale-95"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-red-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    {/* Category & Version Pill Line */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-zinc-400 font-mono font-medium">
                        {project.version}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      className="text-xl font-bold text-zinc-950 hover:text-violet-600 transition-colors leading-tight cursor-pointer"
                      onClick={() => setPreviewProject(project.detail)}
                    >
                      {project.title}
                    </h4>

                    {/* Description */}
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-zinc-50 border border-zinc-100/80 text-zinc-600 text-[11px] font-medium py-1 px-3 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="bg-zinc-50 border border-zinc-100/80 text-zinc-400 text-[11px] font-medium py-1 px-3 rounded-full">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-5 border-t border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/50">
                    {/* Left: Price & Download label */}
                    <div className="text-left">
                      <div className="text-2xl font-black text-zinc-950 tracking-tight">{project.price}</div>
                      <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                        Instant Download
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* Live Preview / Share Square Button */}
                      <button
                        onClick={(e) => handleShare(project, e)}
                        className="w-12 h-12 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-violet-600 flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative"
                        title={isCopied ? "Link Copied!" : "Share Project"}
                      >
                        {isCopied ? (
                          <span className="text-[10px] font-bold text-violet-600 uppercase">Copied</span>
                        ) : (
                          <ExternalLink className="w-5 h-5" />
                        )}
                      </button>

                      {/* Main Button (Explore / Download) */}
                      {isPurchased ? (
                        <button
                          onClick={(e) => handleDownload(project, e)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-all text-sm group"
                        >
                          <Download className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => setPreviewProject(project.detail)}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(109,40,217,0.2)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] transition-all text-sm group"
                        >
                          <ShoppingBag className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />
                          Explore
                        </button>
                      )}
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
