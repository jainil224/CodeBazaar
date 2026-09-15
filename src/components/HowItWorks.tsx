import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Lock,
  User,
  Download,
  Search,
  Tag,
  Filter,
  LayoutGrid,
  CreditCard,
  ShieldCheck,
  KeyRound,
  Receipt,
  ClipboardList,
  Clock,
  PackageCheck,
  ListChecks,
  FileDown,
  CheckCircle2,
  FolderDown,
  Archive,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

interface Satellite {
  icon: React.ElementType;
  color: string;
}

interface RadarPanelProps {
  accent: string;
  centerIcon: React.ElementType;
  satellites: Satellite[];
}

interface WorkflowStepCardProps {
  number: number;
  eyebrow: string;
  heading: string;
  accentWord: string;
  desc: string;
  accent: string;
  centerIcon: React.ElementType;
  satellites: Satellite[];
}

/* =========================================================
   RADAR / VISUAL PANEL  — dark-themed
   ========================================================= */

function RadarPanel({
  accent,
  centerIcon: CenterIcon,
  satellites,
}: RadarPanelProps) {
  const ringSizes = [90, 160, 230, 300, 370, 440];

  const positions = [
    { top: "18%", left: "22%", rotate: "-8deg" },
    { top: "16%", left: "76%", rotate: "7deg" },
    { top: "75%", left: "18%", rotate: "6deg" },
    { top: "78%", left: "78%", rotate: "-7deg" },
  ];

  return (
    <div
      className="relative overflow-hidden min-h-[300px] md:min-h-[360px] lg:min-h-[400px] flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${accent}22 0%, ${accent}0a 40%, transparent 72%)`,
      }}
    >
      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.18,
          backgroundImage: `radial-gradient(${accent}55 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 72%)",
        }}
      />

      {/* Ambient glow blob */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: accent,
          opacity: 0.1,
          filter: "blur(55px)",
        }}
      />

      {/* Concentric rings */}
      {ringSizes.map((size, index) => (
        <div
          key={index}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: `1px solid ${accent}`,
            opacity: Math.max(0.06, 0.22 - index * 0.03),
          }}
        />
      ))}

      {/* Satellite stickers */}
      {satellites.map(({ icon: Icon, color }, index) => {
        const position = positions[index];
        return (
          <div
            key={index}
            className="absolute z-10"
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Glow behind sticker */}
            <div
              className="absolute rounded-2xl"
              style={{
                width: 60,
                height: 60,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) scale(1.5)",
                background: color,
                opacity: 0.25,
                filter: "blur(14px)",
              }}
            />

            {/* Sticker — dark glass card */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                transform: `rotate(${position.rotate})`,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1.5px solid ${color}45`,
                boxShadow: `0 8px 24px -6px ${color}55, 0 2px 6px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Coloured inner square */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `linear-gradient(145deg, ${color}dd 0%, ${color}99 100%)`,
                  boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.3)`,
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    top: -8,
                    left: -8,
                    background: "rgba(255,255,255,0.3)",
                    filter: "blur(5px)",
                  }}
                />
                <Icon size={19} className="relative text-white" strokeWidth={2.1} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Centre icon */}
      <div className="absolute z-20 flex items-center justify-center" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
        {/* Large glow */}
        <div
          className="absolute rounded-full"
          style={{ width: 160, height: 160, background: accent, opacity: 0.2, filter: "blur(30px)" }}
        />

        {/* Outer glass ring */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1.5px solid ${accent}55`,
            boxShadow: `0 16px 40px -10px ${accent}88, 0 4px 12px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Coloured inner pill */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              width: 62,
              height: 62,
              borderRadius: 20,
              background: `linear-gradient(145deg, ${accent} 0%, ${accent}bb 100%)`,
              boxShadow: `inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -5px 10px rgba(0,0,0,0.3)`,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{ width: 40, height: 40, top: -14, left: -14, background: "rgba(255,255,255,0.35)", filter: "blur(8px)" }}
            />
            <CenterIcon size={29} className="relative text-white" strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WORKFLOW CARD  — dark glass-morphism
   ========================================================= */

function WorkflowStepCard({
  number,
  eyebrow,
  heading,
  accentWord,
  desc,
  accent,
  centerIcon,
  satellites,
}: WorkflowStepCardProps) {
  return (
    <article
      className="
        group
        relative
        overflow-hidden
        grid
        grid-cols-1
        lg:grid-cols-2
        transition-all
        duration-500
        hover:-translate-y-1
      "
      style={{
        borderRadius: 28,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: `
          0 1px 0 rgba(255,255,255,0.07) inset,
          0 24px 56px -20px rgba(0,0,0,0.55),
          0 0 0 1px rgba(0,0,0,0.2)
        `,
      }}
    >
      {/* Accent colour stripe at top-left corner */}
      <div
        className="absolute top-0 left-0 w-40 h-[2px] rounded-full opacity-60"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />

      {/* Subtle inner glow on hover */}
      <div
        className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent}12 0%, transparent 65%)` }}
      />

      {/* Left visual panel */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRight: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <RadarPanel accent={accent} centerIcon={centerIcon} satellites={satellites} />
      </div>

      {/* Right content panel */}
      <div className="relative flex flex-col justify-center px-7 py-10 sm:px-10 md:px-12 lg:px-12 xl:px-14">
        {/* Step counter */}
        <div
          className="absolute top-7 right-8 text-sm font-semibold tracking-widest"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          {String(number).padStart(2, "0")}
        </div>

        <div className="max-w-xl">
          {/* Eyebrow pill badge */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}35`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            />
            <span
              className="text-[11px] sm:text-xs font-bold tracking-[0.13em] uppercase"
              style={{ color: accent }}
            >
              {eyebrow}
            </span>
          </div>

          {/* Heading — bright white for dark bg */}
          <h3
            className="
              text-[30px]
              sm:text-[36px]
              md:text-[40px]
              lg:text-[38px]
              xl:text-[42px]
              font-bold
              tracking-[-0.035em]
              text-white
            "
            style={{ lineHeight: 1.1 }}
          >
            {heading}{" "}
            <span
              className="italic font-serif"
              style={{ color: accent }}
            >
              {accentWord}
            </span>
          </h3>

          {/* Description — highly readable on dark */}
          <p
            className="
              mt-5
              text-[14px]
              sm:text-[15px]
              md:text-base
              leading-[1.8]
            "
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {desc}
          </p>

          {/* Bottom step indicator */}
          <div className="mt-7 flex items-center gap-3">
            <div
              className="h-[2px] w-10 rounded-full"
              style={{ background: accent, opacity: 0.75 }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Step {number} of 4
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   WORKFLOW DATA
   ========================================================= */

const steps = [
  {
    number: 1,
    eyebrow: "Product Selection",
    heading: "Choose your perfect",
    accentWord: "codebase",
    desc: "Browse our catalog of verified templates and select the codebase that fits your tech stack and project needs.",
    accent: "#3b82f6",
    centerIcon: Layers,
    satellites: [
      { icon: Search,     color: "#f97316" },
      { icon: Tag,        color: "#3b82f6" },
      { icon: Filter,     color: "#22c55e" },
      { icon: LayoutGrid, color: "#a855f7" },
    ],
  },
  {
    number: 2,
    eyebrow: "Secure Checkout",
    heading: "Pay with total",
    accentWord: "confidence",
    desc: "Complete checkout securely via our payment options. Payments are protected and keys are instantly provisioned.",
    accent: "#8b5cf6",
    centerIcon: Lock,
    satellites: [
      { icon: CreditCard,  color: "#f59e0b" },
      { icon: ShieldCheck, color: "#10b981" },
      { icon: KeyRound,    color: "#8b5cf6" },
      { icon: Receipt,     color: "#ef4444" },
    ],
  },
  {
    number: 3,
    eyebrow: "Order Tracking",
    heading: "Your license, always",
    accentWord: "accessible",
    desc: 'Once payment succeeds, your license and code project is immediately listed in the "My Orders" tab of your dashboard.',
    accent: "#d946ef",
    centerIcon: User,
    satellites: [
      { icon: ClipboardList, color: "#0ea5e9" },
      { icon: Clock,         color: "#f97316" },
      { icon: PackageCheck,  color: "#22c55e" },
      { icon: ListChecks,    color: "#d946ef" },
    ],
  },
  {
    number: 4,
    eyebrow: "Instant Delivery",
    heading: "Download your complete",
    accentWord: "project",
    desc: "Download the complete template ZIP archive, setup guide, and documentation anytime to build your application.",
    accent: "#10b981",
    centerIcon: Download,
    satellites: [
      { icon: FileDown,     color: "#10b981" },
      { icon: CheckCircle2, color: "#3b82f6" },
      { icon: FolderDown,   color: "#f59e0b" },
      { icon: Archive,      color: "#ef4444" },
    ],
  },
];

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function HowItWorks() {
  return (
    <section
      id="how-to-get-code"
      className="relative w-full overflow-hidden pb-20 sm:pb-24 lg:pb-28 px-5 sm:px-6 bg-transparent z-10 -mt-[128px] pt-[208px] sm:pt-[224px] lg:pt-[240px]"
    >
      {/* ===================================================
          Header
      =================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto text-center mb-14 sm:mb-16 lg:mb-20"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#ffffff" }}
          />
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-white">
            Simple Workflow
          </p>
        </div>

        <h2
          className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-[-0.045em] text-white"
          style={{ lineHeight: 1.05 }}
        >
          How to Get Your
          <span className="italic font-serif text-white drop-shadow-sm ml-2">
            Purchased Code
          </span>
        </h2>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Get access to premium code configurations in four straightforward steps.
        </p>
      </motion.div>

      {/* ===================================================
          Workflow cards
      =================================================== */}
      <div className="relative max-w-6xl mx-auto">
        {/* Vertical connecting line */}
        <div
          className="hidden lg:block absolute left-[27px] top-[80px] bottom-[80px] w-px"
          style={{
            background: "linear-gradient(to bottom, #3b82f6, #8b5cf6, #d946ef, #10b981)",
            opacity: 0.25,
          }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="flex flex-col gap-8 sm:gap-10 lg:gap-12"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
              }}
              className="relative lg:pl-[74px]"
            >
              {/* Timeline number bubble */}
              <div
                className="
                  hidden
                  lg:flex
                  absolute
                  left-0
                  top-1/2
                  -translate-y-1/2
                  w-[56px]
                  h-[56px]
                  rounded-full
                  items-center
                  justify-center
                  z-30
                  font-bold
                  text-base
                "
                style={{
                  color: step.accent,
                  background: `${step.accent}15`,
                  border: `2px solid ${step.accent}55`,
                  boxShadow: `0 8px 20px -8px ${step.accent}80, 0 0 0 4px ${step.accent}10`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {step.number}
              </div>

              <WorkflowStepCard {...step} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
