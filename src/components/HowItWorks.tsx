import React from "react";
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
  ArrowRight,
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
   RADAR / VISUAL PANEL
   ========================================================= */

function RadarPanel({
  accent,
  centerIcon: CenterIcon,
  satellites,
}: RadarPanelProps) {
  const ringSizes = [110, 200, 290, 380, 470, 560, 650];

  const positions = [
    {
      top: "15%",
      left: "25%",
      rotate: "-7deg",
    },
    {
      top: "16%",
      left: "75%",
      rotate: "6deg",
    },
    {
      top: "73%",
      left: "18%",
      rotate: "5deg",
    },
    {
      top: "78%",
      left: "76%",
      rotate: "-6deg",
    },
  ];

  return (
    <div
      className="relative overflow-hidden min-h-[330px] md:min-h-[390px] lg:min-h-[430px]"
      style={{
        background: `
          radial-gradient(
            circle at 48% 58%,
            ${accent}25 0%,
            ${accent}12 25%,
            rgba(255,255,255,0.92) 62%,
            #ffffff 100%
          )
        `,
      }}
    >
      {/* ---------------------------------------------------
          Very subtle dot texture
      --------------------------------------------------- */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.32,
          backgroundImage: `
            radial-gradient(
              ${accent}35 1px,
              transparent 1px
            )
          `,
          backgroundSize: "18px 18px",
          maskImage:
            "radial-gradient(circle at 45% 55%, black 0%, black 35%, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(circle at 45% 55%, black 0%, black 35%, transparent 76%)",
        }}
      />

      {/* ---------------------------------------------------
          Large soft ambient glow
      --------------------------------------------------- */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300,
          height: 300,
          left: "46%",
          top: "57%",
          transform: "translate(-50%, -50%)",
          background: accent,
          opacity: 0.08,
          filter: "blur(60px)",
        }}
      />

      {/* ---------------------------------------------------
          Concentric rings
      --------------------------------------------------- */}
      {ringSizes.map((size, index) => (
        <div
          key={index}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            left: "46%",
            top: "57%",
            transform: "translate(-50%, -50%)",
            border: `1px solid ${accent}`,
            opacity: Math.max(0.12, 0.28 - index * 0.025),
          }}
        />
      ))}

      {/* ---------------------------------------------------
          Floating satellite stickers
      --------------------------------------------------- */}
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
            {/* Glow */}
            <div
              className="absolute rounded-2xl"
              style={{
                width: 64,
                height: 64,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) scale(1.45)",
                background: color,
                opacity: 0.18,
                filter: "blur(13px)",
              }}
            />

            {/* Outer white sticker */}
            <div
              className="relative flex items-center justify-center bg-white"
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                transform: `rotate(${position.rotate})`,
                boxShadow: `
                  0 12px 25px -8px ${color}70,
                  0 3px 8px rgba(15,23,42,0.07)
                `,
              }}
            >
              {/* Inner colored square */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: `
                    linear-gradient(
                      145deg,
                      ${color} 0%,
                      ${color}cc 100%
                    )
                  `,
                  boxShadow: `
                    inset 0 1px 2px rgba(255,255,255,0.55),
                    inset 0 -3px 7px rgba(0,0,0,0.14)
                  `,
                }}
              >
                {/* highlight */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    top: -10,
                    left: -10,
                    background: "rgba(255,255,255,0.38)",
                    filter: "blur(5px)",
                  }}
                />

                <Icon
                  size={21}
                  className="relative text-white"
                  strokeWidth={2.1}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* ---------------------------------------------------
          Center icon
      --------------------------------------------------- */}
      <div
        className="absolute z-20 flex items-center justify-center"
        style={{
          left: "46%",
          top: "57%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Large glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 170,
            height: 170,
            background: accent,
            opacity: 0.22,
            filter: "blur(27px)",
          }}
        />

        {/* Outer white frame */}
        <div
          className="relative flex items-center justify-center bg-white"
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            boxShadow: `
              0 18px 38px -10px ${accent}70,
              0 5px 14px rgba(15,23,42,0.09)
            `,
          }}
        >
          {/* Colored center */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              width: 66,
              height: 66,
              borderRadius: 21,
              background: `
                linear-gradient(
                  145deg,
                  ${accent} 0%,
                  ${accent}c4 100%
                )
              `,
              boxShadow: `
                inset 0 2px 3px rgba(255,255,255,0.55),
                inset 0 -5px 9px rgba(0,0,0,0.18)
              `,
            }}
          >
            {/* Center highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: 44,
                height: 44,
                top: -17,
                left: -17,
                background: "rgba(255,255,255,0.4)",
                filter: "blur(7px)",
              }}
            />

            <CenterIcon
              size={31}
              className="relative text-white"
              strokeWidth={2.2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WORKFLOW CARD
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
        bg-white
        border
        border-gray-200/80
        transition-all
        duration-500
        hover:-translate-y-1
      "
      style={{
        borderRadius: 28,
        boxShadow: `
          0 1px 2px rgba(15,23,42,0.03),
          0 20px 50px -25px rgba(15,23,42,0.22)
        `,
      }}
    >
      {/* ---------------------------------------------------
          Left visual
      --------------------------------------------------- */}
      <RadarPanel
        accent={accent}
        centerIcon={centerIcon}
        satellites={satellites}
      />

      {/* ---------------------------------------------------
          Right content
      --------------------------------------------------- */}
      <div className="relative flex flex-col justify-center px-7 py-10 sm:px-10 md:px-12 lg:px-12 xl:px-14">
        {/* Step number */}
        <div
          className="absolute top-7 right-8 text-sm font-semibold tracking-widest"
          style={{
            color: "#aeb4c2",
          }}
        >
          {String(number).padStart(2, "0")}
        </div>

        <div className="max-w-xl">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
            style={{
              background: `${accent}12`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: accent,
              }}
            />

            <span
              className="text-[11px] sm:text-xs font-bold tracking-[0.13em] uppercase"
              style={{
                color: accent,
              }}
            >
              {eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h3
            className="
              text-[34px]
              sm:text-[38px]
              md:text-[42px]
              lg:text-[40px]
              xl:text-[44px]
              font-bold
              tracking-[-0.035em]
              text-slate-950
            "
            style={{
              lineHeight: 1.08,
            }}
          >
            {heading}{" "}
            <span
              className="italic font-serif"
              style={{
                color: accent,
              }}
            >
              {accentWord}
            </span>
          </h3>

          {/* Description */}
          <p
            className="
              mt-6
              text-[15px]
              sm:text-base
              md:text-[17px]
              text-slate-500
              leading-[1.75]
              max-w-lg
            "
          >
            {desc}
          </p>

          {/* Small decorative bottom indicator */}
          <div className="mt-7 flex items-center gap-3">
            <div
              className="h-[2px] w-9 rounded-full"
              style={{
                background: accent,
                opacity: 0.7,
              }}
            />

            <span className="text-xs font-medium text-slate-400">
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
    desc:
      "Browse our catalog of verified templates and select the codebase that fits your tech stack and project needs.",
    accent: "#3b82f6",
    centerIcon: Layers,

    satellites: [
      {
        icon: Search,
        color: "#f97316",
      },
      {
        icon: Tag,
        color: "#3b82f6",
      },
      {
        icon: Filter,
        color: "#22c55e",
      },
      {
        icon: LayoutGrid,
        color: "#a855f7",
      },
    ],
  },

  {
    number: 2,
    eyebrow: "Secure Checkout",
    heading: "Pay with total",
    accentWord: "confidence",
    desc:
      "Complete checkout securely via our payment options. Payments are protected and keys are instantly provisioned.",
    accent: "#8b5cf6",
    centerIcon: Lock,

    satellites: [
      {
        icon: CreditCard,
        color: "#f59e0b",
      },
      {
        icon: ShieldCheck,
        color: "#10b981",
      },
      {
        icon: KeyRound,
        color: "#8b5cf6",
      },
      {
        icon: Receipt,
        color: "#ef4444",
      },
    ],
  },

  {
    number: 3,
    eyebrow: "Order Tracking",
    heading: "Your license, always",
    accentWord: "accessible",
    desc:
      'Once payment succeeds, your license and code project is immediately listed in the "My Orders" tab of your dashboard.',
    accent: "#d946ef",
    centerIcon: User,

    satellites: [
      {
        icon: ClipboardList,
        color: "#0ea5e9",
      },
      {
        icon: Clock,
        color: "#f97316",
      },
      {
        icon: PackageCheck,
        color: "#22c55e",
      },
      {
        icon: ListChecks,
        color: "#d946ef",
      },
    ],
  },

  {
    number: 4,
    eyebrow: "Instant Delivery",
    heading: "Download your complete",
    accentWord: "project",
    desc:
      "Download the complete template ZIP archive, setup guide, and documentation anytime to build your application.",
    accent: "#10b981",
    centerIcon: Download,

    satellites: [
      {
        icon: FileDown,
        color: "#10b981",
      },
      {
        icon: CheckCircle2,
        color: "#3b82f6",
      },
      {
        icon: FolderDown,
        color: "#f59e0b",
      },
      {
        icon: Archive,
        color: "#ef4444",
      },
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
      className="relative w-full overflow-hidden py-20 sm:py-24 lg:py-28 px-5 sm:px-6"
      style={{
        background: "#f7f7f9",
      }}
    >
      {/* ===================================================
          Background decoration
      =================================================== */}

      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          top: -250,
          left: -250,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.07), transparent 68%)",
        }}
      />

      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          right: -250,
          bottom: -250,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06), transparent 68%)",
        }}
      />

      {/* ===================================================
          Header
      =================================================== */}

      <div className="relative max-w-4xl mx-auto text-center mb-14 sm:mb-16 lg:mb-20">
        <div className="inline-flex items-center gap-2 mb-4">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#8b5cf6",
            }}
          />

          <p
            className="
              text-[11px]
              sm:text-xs
              font-bold
              tracking-[0.16em]
              uppercase
              text-violet-500
            "
          >
            Simple Workflow
          </p>
        </div>

        <h2
          className="
            text-4xl
            sm:text-5xl
            lg:text-[54px]
            font-bold
            tracking-[-0.045em]
            text-slate-950
          "
          style={{
            lineHeight: 1.05,
          }}
        >
          How to Get Your
          <span
            className="italic font-serif text-violet-500 ml-2"
          >
            Purchased Code
          </span>
        </h2>

        <p
          className="
            mt-5
            text-sm
            sm:text-base
            md:text-lg
            text-slate-500
            max-w-2xl
            mx-auto
            leading-relaxed
          "
        >
          Get access to premium code configurations in four straightforward
          steps.
        </p>
      </div>

      {/* ===================================================
          Workflow
      =================================================== */}

      <div className="relative max-w-6xl mx-auto">
        {/* -------------------------------------------------
            Subtle connecting line
        ------------------------------------------------- */}

        <div
          className="
            hidden
            lg:block
            absolute
            left-[27px]
            top-[80px]
            bottom-[80px]
            w-px
          "
          style={{
            background:
              "linear-gradient(to bottom, #3b82f6, #8b5cf6, #d946ef, #10b981)",
            opacity: 0.18,
          }}
        />

        <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative lg:pl-[74px]"
            >
              {/* Timeline number */}
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
                  bg-white
                  items-center
                  justify-center
                  z-30
                  font-bold
                  text-base
                "
                style={{
                  color: step.accent,
                  border: `2px solid ${step.accent}`,
                  boxShadow: `
                    0 8px 20px -8px ${step.accent}70
                  `,
                }}
              >
                {step.number}
              </div>

              <WorkflowStepCard {...step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
