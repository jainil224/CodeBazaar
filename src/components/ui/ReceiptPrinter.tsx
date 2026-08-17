import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReceiptPrinterStage = "processing" | "printing" | "complete";
export type ReceiptFeedMotion = "smooth" | "stepped";

export type ReceiptPrinterRootProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> & {
  /** Disables all stage transitions when false. */
  animate?: boolean;
  children: ReactNode;
  /** Controls whether the paper feeds continuously or one line at a time. */
  feedMotion?: ReceiptFeedMotion;
  /** Current state of the printer. */
  stage: ReceiptPrinterStage;
};

export type ReceiptPrinterMachineProps = ComponentPropsWithoutRef<"div">;
export type ReceiptPrinterHeaderProps = ComponentPropsWithoutRef<"div">;
export type ReceiptPrinterScreenProps = ComponentPropsWithoutRef<"div">;
export type ReceiptPrinterOutputProps = ComponentPropsWithoutRef<"div">;
export type ReceiptPrinterPaperProps = ComponentPropsWithoutRef<"article">;

export type ReceiptPrinterStatusProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /** Custom status content. Defaults to a label derived from the current stage. */
  children?: ReactNode;
};

type ReceiptPrinterContextValue = {
  animate: boolean;
  feedMotion: ReceiptFeedMotion;
  shouldMove: boolean;
  stage: ReceiptPrinterStage;
};

const ReceiptPrinterContext = createContext<ReceiptPrinterContextValue | null>(
  null,
);

const easeOut = [0.23, 1, 0.32, 1] as const;
const easeInOut = [0.77, 0, 0.175, 1] as const;

const receiptToothCount = 36;
const receiptToothDepth = 4;
const receiptToothPoints = Array.from(
  { length: receiptToothCount * 2 },
  (_, index) => {
    const x = 100 - ((index + 1) * 100) / (receiptToothCount * 2);
    const y = index % 2 === 0 ? "100%" : `calc(100% - ${receiptToothDepth}px)`;

    return `${x}% ${y}`;
  },
).join(", ");
export const receiptClipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${receiptToothDepth}px), ${receiptToothPoints})`;

const printingTransformKeyframes = [
  "translateY(calc(-100% + 8px))",
  "translateY(-88%)",
  "translateY(-88%)",
  "translateY(-76%)",
  "translateY(-76%)",
  "translateY(-62%)",
  "translateY(-62%)",
  "translateY(-48%)",
  "translateY(-48%)",
  "translateY(-34%)",
  "translateY(-34%)",
  "translateY(-20%)",
  "translateY(-20%)",
  "translateY(-10%)",
  "translateY(-10%)",
  "translateY(-3%)",
  "translateY(-3%)",
  "translateY(0%)",
];

const printingKeyframeTimes = [
  0, 0.08, 0.11, 0.20, 0.23, 0.32, 0.35, 0.44, 0.47, 0.56, 0.59, 0.68,
  0.71, 0.80, 0.83, 0.92, 0.95, 1,
];

const statusLabels: Record<ReceiptPrinterStage, ReactNode> = {
  processing: "Verifying secure payment transaction...",
  printing: "Printing official CodeBazaar receipt...",
  complete: "Receipt ready! Source code & PDF unlocked",
};

const machineClassName =
  "relative isolate w-full overflow-hidden rounded-[2rem] border border-white/15 bg-[#202024] p-3.5 pb-6.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(61,90,254,0.15)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[url('/textures/plastic-noise.svg')] before:bg-[length:180px_180px] before:bg-repeat before:opacity-10 before:content-['']";

function useReceiptPrinter(component: string) {
  const context = useContext(ReceiptPrinterContext);

  if (!context) {
    throw new Error(`${component} must be used inside ReceiptPrinter.Root.`);
  }

  return context;
}

export function ReceiptPrinterRoot({
  "aria-label": ariaLabel = "Receipt printer",
  animate = true,
  children,
  className,
  feedMotion = "stepped",
  stage,
  ...props
}: ReceiptPrinterRootProps) {
  const shouldReduceMotion = useReducedMotion();
  const context = {
    animate,
    feedMotion,
    shouldMove: animate && !shouldReduceMotion,
    stage,
  };

  return (
    <ReceiptPrinterContext.Provider value={context}>
      <section
        aria-label={ariaLabel}
        className={cn(
          "relative isolate flex w-full max-w-md flex-col items-center select-none",
          className,
        )}
        data-stage={stage}
        {...props}
      >
        {children}
      </section>
    </ReceiptPrinterContext.Provider>
  );
}

export function ReceiptPrinterMachine({
  children,
  className,
  ...props
}: ReceiptPrinterMachineProps) {
  return (
    <div className={cn(machineClassName, className)} {...props}>
      {/* Signature Hero Gradient Accent Bar across top edge */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange" />
      
      {children}
      
      {/* Realistic ejection slot */}
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-2 z-40 h-2.5 rounded-full border border-black/90 bg-[#07070a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden"
      >
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-primary-pink/50 to-transparent blur-[0.5px]" />
      </div>
    </div>
  );
}

export function ReceiptPrinterHeader({
  children,
  className,
  ...props
}: ReceiptPrinterHeaderProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-10 items-center justify-between px-1 mb-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ReceiptPrinterScreen({
  children,
  className,
  ...props
}: ReceiptPrinterScreenProps) {
  return (
    <div
      className={cn(
        "relative z-10 isolate overflow-hidden rounded-2xl border border-white/10 bg-[#121215] p-3.5 text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function StatusIndicator({
  animate,
  stage,
}: {
  animate: boolean;
  move?: boolean;
  stage: ReceiptPrinterStage;
}) {
  const isComplete = stage === "complete";

  return (
    <span
      aria-hidden="true"
      className="relative grid size-5 shrink-0 place-items-center"
    >
      <AnimatePresence initial={false} mode="sync">
        {isComplete ? (
          <motion.span
            animate={{ opacity: 1, transform: "scale(1)" }}
            className="col-start-1 row-start-1 grid place-items-center text-primary-green drop-shadow-[0_0_10px_rgba(0,230,118,0.8)]"
            exit={{
              opacity: animate ? 0 : 1,
              transform: "scale(0.95)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: "scale(0.9)",
            }}
            key="complete"
            transition={{ duration: animate ? 0.16 : 0, ease: easeOut }}
          >
            <CheckCircle2 size={18} className="stroke-[2.5]" />
          </motion.span>
        ) : (
          <motion.span
            animate={{ opacity: 1, transform: "scale(1)" }}
            className="col-start-1 row-start-1 grid place-items-center text-primary-pink drop-shadow-[0_0_10px_rgba(255,128,171,0.8)]"
            exit={{
              opacity: animate ? 0 : 1,
              transform: "scale(0.95)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: "scale(0.9)",
            }}
            key="working"
            transition={{ duration: animate ? 0.16 : 0, ease: easeOut }}
          >
            <Loader2
              className={cn(
                "animate-spin",
                animate && "motion-reduce:animate-none",
              )}
              size={18}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function ReceiptPrinterStatus({
  children,
  className,
  ...props
}: ReceiptPrinterStatusProps) {
  const { animate, shouldMove, stage } = useReceiptPrinter(
    "ReceiptPrinter.Status",
  );

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2.5", className)}
      {...props}
    >
      <StatusIndicator animate={animate} stage={stage} />
      <div
        aria-live="polite"
        className="grid min-w-0 flex-1 items-center"
        role="status"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            className="col-start-1 row-start-1 truncate font-mono text-xs font-semibold text-white/90 tracking-wide"
            exit={{
              opacity: animate ? 0 : 1,
              transform: shouldMove ? "translateY(-4px)" : "translateY(0px)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: shouldMove ? "translateY(4px)" : "translateY(0px)",
            }}
            key={stage}
            transition={{ duration: animate ? 0.18 : 0, ease: easeOut }}
          >
            {children ?? statusLabels[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReceiptPrinterPaper({
  children,
  className,
  style,
  ...props
}: ReceiptPrinterPaperProps) {
  return (
    <article
      className={cn(
        "relative z-10 w-full bg-gradient-to-b from-[#ffffff] via-[#faf9ff] to-[#f4f2fd] text-[#131127] bg-[url('/textures/receipt-paper.svg')] bg-cover px-3 sm:px-5 pt-4 sm:pt-6 pb-8 sm:pb-10 font-mono shadow-[0_20px_45px_rgba(0,0,0,0.45),0_0_35px_rgba(99,41,230,0.15)] border-t border-purple-200/50 rounded-t-sm",
        className,
      )}
      style={{ clipPath: receiptClipPath, ...style }}
      {...props}
    >
      {children}
    </article>
  );
}

export function ReceiptPrinterOutput({
  children,
  className,
  ...props
}: ReceiptPrinterOutputProps) {
  const { animate, feedMotion, shouldMove, stage } = useReceiptPrinter(
    "ReceiptPrinter.Output",
  );
  const isReceiptVisible = stage !== "processing";
  const shouldUseSteppedFeed =
    feedMotion === "stepped" && stage === "printing" && shouldMove;

  return (
    <div
      className={cn(
        "relative z-30 -mt-3.5 w-[calc(92%+0.5rem)] max-w-full px-2 pb-4 transition-all",
        stage === "printing" ? "overflow-hidden" : "overflow-visible",
        className,
      )}
      {...props}
    >
      {isReceiptVisible ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 -top-1 z-40 h-3 bg-black/85 blur-[4px]"
        />
      ) : null}

      <motion.div
        animate={{
          opacity: isReceiptVisible ? 1 : 0,
          transform:
            stage === "printing" && shouldMove
              ? shouldUseSteppedFeed
                ? printingTransformKeyframes
                : "translateY(0%)"
              : isReceiptVisible || !shouldMove
                ? "translateY(0%)"
                : "translateY(calc(-100% + 8px))",
        }}
        aria-hidden={stage !== "complete"}
        className="relative isolate before:pointer-events-none before:absolute before:inset-x-2 before:top-2 before:bottom-2 before:z-0 before:rounded-sm before:shadow-[0_16px_40px_rgba(0,0,0,0.5)] before:content-[''] after:pointer-events-none after:absolute after:right-[5%] after:bottom-0 after:left-[5%] after:z-0 after:h-5 after:translate-y-2.5 after:rounded-full after:bg-black/35 after:blur-md after:content-['']"
        initial={false}
        transition={{
          opacity: { duration: animate ? 0.16 : 0, ease: easeOut },
          transform: {
            duration: shouldMove ? 2.2 : 0,
            ease: shouldUseSteppedFeed ? "linear" : easeInOut,
            times: shouldUseSteppedFeed ? printingKeyframeTimes : undefined,
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const ReceiptPrinter = {
  Header: ReceiptPrinterHeader,
  Machine: ReceiptPrinterMachine,
  Output: ReceiptPrinterOutput,
  Paper: ReceiptPrinterPaper,
  Root: ReceiptPrinterRoot,
  Screen: ReceiptPrinterScreen,
  Status: ReceiptPrinterStatus,
};
