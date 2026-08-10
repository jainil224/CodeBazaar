import { useState } from 'react';
import { FileCode, Monitor, Tablet, Smartphone, Download, ArrowLeft, Folder, ChevronRight, File } from 'lucide-react';
import { downloadProjectZip } from '../utils/downloadHelper';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface PlaygroundData {
  title: string;
  price: string;
  previewUrl?: string;
  files: FileNode[];
  mockupContent: React.ReactNode;
}

// Pre-fill mock files and content for all projects
const MOCK_PROJECT_PLAYGROUNDS: Record<string, PlaygroundData> = {
  'proj-codebazaar-ui': {
    title: 'CodeBazaar Marketplace UI',
    price: '₹50',
    files: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'components',
            type: 'folder',
            children: [
              {
                name: 'FeaturedProjects.tsx',
                type: 'file',
                content: `import { useState } from 'react';
import { Code2, Heart, ShoppingBag, ExternalLink } from 'lucide-react';

export default function FeaturedProjects() {
  const [favorites, setFavorites] = useState([]);
  
  return (
    <section className="py-24 bg-white text-zinc-950">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-black text-slate-900">Featured Templates</h2>
        {/* Render clean white cards */}
      </div>
    </section>
  );
}`
              },
              {
                name: 'ProjectPreviewModal.tsx',
                type: 'file',
                content: `import { X, Share2, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ProjectPreviewModal({ project, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Light-themed product overlay */}
      <div className="w-full max-w-5xl bg-[#f8fafc] rounded-3xl p-6 flex flex-row">
        {/* Mockup + Technical Details */}
      </div>
    </div>
  );
}`
              }
            ]
          },
          {
            name: 'App.tsx',
            type: 'file',
            content: `import React from 'react';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';

export default function App() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Hero />
      <FeaturedProjects />
    </main>
  );
}`
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        content: `{
  "name": "codebazaar-marketplace-ui",
  "version": "2.0.0",
  "dependencies": {
    "react": "^19.2.0",
    "framer-motion": "^13.0.0",
    "lucide-react": "^1.30.0",
    "tailwindcss": "^4.0.0"
  }
}`
      }
    ],
    mockupContent: (
      <div className="bg-[#0c0c18] text-white h-full w-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
        <div className="absolute inset-0 bg-radial-gradient from-violet-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">CodeBazaar</h1>
        <p className="text-white/60 text-xs mt-2 max-w-sm">Premium React 19 templates marketplace with Razorpay & Firebase integrations.</p>
        <div className="mt-6 flex gap-2">
          <div className="w-16 h-8 bg-white/5 border border-white/10 rounded-lg" />
          <div className="w-24 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-[10px] font-bold">Get Codebase</div>
        </div>
      </div>
    )
  },
  'proj-saas': {
    title: 'SaaS Platform Boilerplate',
    price: '₹50',
    files: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'app',
            type: 'folder',
            children: [
              {
                name: 'page.tsx',
                type: 'file',
                content: `import Hero from '@/components/Hero';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <Pricing />
    </main>
  );
}`
              },
              {
                name: 'dashboard',
                type: 'folder',
                children: [
                  {
                    name: 'page.tsx',
                    type: 'file',
                    content: `export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      <p className="text-slate-400">Welcome to your SaaS platform workspace.</p>
    </div>
  );
}`
                  }
                ]
              }
            ]
          },
          {
            name: 'components',
            type: 'folder',
            children: [
              {
                name: 'StripeCheckout.tsx',
                type: 'file',
                content: `import { loadStripe } from '@stripe/stripe-js';

export default function StripeCheckout() {
  const handleCheckout = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    // Redirect to checkout
  };

  return (
    <button onClick={handleCheckout} className="bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl">
      Subscribe Now
    </button>
  );
}`
              }
            ]
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        content: `{
  "name": "nextjs-saas-starter",
  "version": "1.2.0",
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "stripe": "^15.0.0",
    "@prisma/client": "^5.10.0"
  }
}`
      }
    ],
    mockupContent: (
      <div className="bg-slate-950 text-white h-full w-full flex flex-col p-6 overflow-hidden select-none">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <span className="font-bold text-sm">SaaSApp</span>
          <div className="w-12 h-6 bg-slate-800 rounded-md" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-xl font-bold">Choose Subscription Plan</h2>
          <p className="text-slate-400 text-xs mt-1">Unlock all features inside your custom dashboard.</p>
          <div className="mt-4 w-40 h-28 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-emerald-400 font-bold">Pro Plan</span>
            <span className="text-lg font-black">$29/mo</span>
            <div className="h-6 w-full bg-slate-800 rounded flex items-center justify-center text-[9px] font-bold">Subscribe</div>
          </div>
        </div>
      </div>
    )
  },
  'proj-ai-chat': {
    title: 'AI Chat Bot Interface',
    price: '₹50',
    files: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'components',
            type: 'folder',
            children: [
              {
                name: 'ChatInterface.tsx',
                type: 'file',
                content: `import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Render stream-parsed messages */}
      </div>
    </div>
  );
}`
              }
            ]
          },
          {
            name: 'utils',
            type: 'folder',
            children: [
              {
                name: 'openaiStream.ts',
                type: 'file',
                content: `export async function openaiStream(prompt: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
  return res.body; // ReadableStream
}`
              }
            ]
          }
        ]
      }
    ],
    mockupContent: (
      <div className="bg-zinc-950 text-zinc-100 h-full w-full flex flex-col p-4 overflow-hidden select-none justify-between">
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs w-fit max-w-[80%]">
            Hello! How can I help you build your application today?
          </div>
          <div className="bg-violet-600 text-white rounded-xl p-3 text-xs w-fit max-w-[80%] self-end">
            Explain the stream parser implementation.
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs w-fit max-w-[80%]">
            Sure! The stream parser processes incoming UTF-8 bytes and pushes...
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-3 flex gap-2">
          <div className="flex-1 h-8 bg-zinc-900 rounded-xl" />
          <div className="w-8 h-8 bg-violet-600 rounded-xl" />
        </div>
      </div>
    )
  },
  'proj-ecom': {
    title: 'E-Commerce Storefront',
    price: '₹50',
    files: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'context',
            type: 'folder',
            children: [
              {
                name: 'CartContext.tsx',
                type: 'file',
                content: `import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  return <CartContext.Provider value={{ items }}>{children}</CartContext.Provider>;
}`
              }
            ]
          }
        ]
      }
    ],
    mockupContent: (
      <div className="bg-white text-slate-800 h-full w-full flex flex-col p-4 overflow-hidden select-none justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-bold text-sm">ShopCentral</span>
          <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">Cart (2)</span>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 items-center">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col justify-between h-28">
            <div className="w-8 h-8 bg-slate-200 rounded" />
            <span className="text-[10px] font-bold">Minimal Headset</span>
            <span className="text-xs font-black">$49</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col justify-between h-28">
            <div className="w-8 h-8 bg-slate-200 rounded" />
            <span className="text-[10px] font-bold">Ergonomic Mouse</span>
            <span className="text-xs font-black">$29</span>
          </div>
        </div>
      </div>
    )
  },
  'proj-portfolio': {
    title: 'Creative Studio Portfolio',
    price: '₹50',
    files: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'main.js',
            type: 'file',
            content: `import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Magnetic button triggers
gsap.to('.magnetic-btn', {
  scrollTrigger: {
    trigger: '.portfolio-grid',
    start: 'top center',
    scrub: true
  }
});`
          }
        ]
      }
    ],
    mockupContent: (
      <div className="bg-zinc-950 text-zinc-100 h-full w-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/20" />
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Interactive Agency</span>
        <h2 className="text-2xl font-black mt-2 leading-none uppercase">CREATIVE<br />STUDIO.</h2>
        <span className="text-xs underline underline-offset-4 text-violet-400 mt-4 cursor-pointer">View Reels</span>
      </div>
    )
  }
};

interface FileTreeProps {
  nodes: FileNode[];
  onSelectFile: (content: string) => void;
  activeFileName: string;
}

function FileTree({ nodes, onSelectFile, activeFileName }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'components': true,
    'app': true
  });

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.name];

    if (isFolder) {
      return (
        <div key={node.name} style={{ paddingLeft: `${depth * 12}px` }}>
          <button
            onClick={() => toggleFolder(node.name)}
            className="flex items-center gap-1.5 py-1 text-slate-300 hover:text-white transition-colors w-full text-left text-xs font-semibold"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
            <Folder className="w-3.5 h-3.5 text-violet-400 fill-violet-400/20 shrink-0" />
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div className="flex flex-col">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={node.name}
        onClick={() => onSelectFile(node.content || '')}
        className={`flex items-center gap-1.5 py-1 pr-2 w-full text-left text-xs transition-all rounded-md ${
          activeFileName === node.name
            ? 'bg-violet-600/20 text-violet-300 border-l-2 border-violet-500 pl-1.5'
            : 'text-slate-400 hover:text-slate-200 pl-5'
        }`}
        style={{ marginLeft: `${depth * 12}px` }}
      >
        <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  };

  return <div className="flex flex-col gap-1">{nodes.map(n => renderNode(n))}</div>;
}

interface ProjectPlaygroundProps {
  projectId: string;
  onClose: () => void;
  onPurchase: (projectId: string, title: string) => void;
  purchasedIds: string[];
}

export default function ProjectPlayground({
  projectId,
  onClose,
  onPurchase,
  purchasedIds,
}: ProjectPlaygroundProps) {
  const data = MOCK_PROJECT_PLAYGROUNDS[projectId];
  
  if (!data) {
    return (
      <div className="bg-[#0a0a16] text-white min-h-screen flex items-center justify-center">
        <p>Project not found.</p>
      </div>
    );
  }

  // Get first available file content to show by default
  const getFirstFile = (nodes: FileNode[]): { name: string; content: string } => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return { name: node.name, content: node.content || '' };
      }
      if (node.type === 'folder' && node.children) {
        const found = getFirstFile(node.children);
        if (found.content) return found;
      }
    }
    return { name: '', content: '' };
  };

  const firstFile = getFirstFile(data.files);
  const [selectedContent, setSelectedContent] = useState(firstFile.content);
  const [selectedFileName, setSelectedFileName] = useState(firstFile.name);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const isPurchased = purchasedIds.includes(projectId);

  const getDeviceWidth = () => {
    if (device === 'mobile') return 'w-[360px]';
    if (device === 'tablet') return 'w-[640px]';
    return 'w-full';
  };

  return (
    <div className="bg-[#090911] text-slate-200 min-h-screen flex flex-col font-sans antialiased overflow-hidden">
      
      {/* ── TOP NAV BAR ─────────────────────────────────────────── */}
      <header className="h-16 border-b border-white/[0.08] bg-[#0c0c17] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-xl px-3 py-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Showroom
          </button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{data.title}</h2>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Live Play Space</span>
          </div>
        </div>

        {/* Device preview toggles */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'desktop' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Desktop Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'tablet' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Tablet Mode"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'mobile' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Mobile Mode"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <div>
          {isPurchased ? (
            <button
              onClick={() => downloadProjectZip(data.title)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(16,185,129,0.15)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          ) : (
            <button
              onClick={() => onPurchase(projectId, data.title)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition-colors"
            >
              Buy Template — {data.price}
            </button>
          )}
        </div>
      </header>

      {/* ── LOWER SPLIT WORKSPACE ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: Code Editor Workspace */}
        <div className="w-[300px] border-r border-white/[0.08] bg-[#0c0c17] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <FileCode className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">File Explorer</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <FileTree
              nodes={data.files}
              onSelectFile={(content) => {
                setSelectedContent(content);
                // Simply set name helper
                const extractName = (nodes: FileNode[]): string => {
                  for (const n of nodes) {
                    if (n.content === content) return n.name;
                    if (n.children) {
                      const res = extractName(n.children);
                      if (res) return res;
                    }
                  }
                  return '';
                };
                setSelectedFileName(extractName(data.files) || 'File');
              }}
              activeFileName={selectedFileName}
            />
          </div>
        </div>

        {/* Center: File Viewer / Code Viewer */}
        <div className="flex-1 border-r border-white/[0.08] bg-[#090911] flex flex-col">
          <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0c0c17] flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-violet-300">{selectedFileName}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Read-Only Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-300 bg-[#06060c]">
            <pre className="grid grid-cols-[30px_1fr] gap-3">
              <span className="text-slate-600 text-right select-none select-none select-none border-r border-white/5 pr-2">
                {selectedContent.split('\n').map((_, i) => `${i + 1}`).join('\n')}
              </span>
              <code className="whitespace-pre">{selectedContent}</code>
            </pre>
          </div>
        </div>

        {/* Right Side: Interactive Mockup Live Sandbox */}
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto">
          <div className={`h-[480px] bg-slate-900 rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden flex flex-col transition-all duration-300 ${getDeviceWidth()}`}>
            
            {/* Mockup viewport header */}
            <div className="bg-slate-950 px-4 py-2 border-b border-white/5 flex items-center gap-1.5 select-none shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-mono ml-4 truncate">Preview Sandbox</span>
            </div>
            
            {/* Viewport container */}
            <div className="flex-1 bg-slate-950">
              {data.mockupContent}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
