import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I access the code after making a purchase?',
    answer: 'Once payment is successfully processed via Razorpay, the "Buy Codebase" button on the project card instantly updates to "Download Code ZIP". Click it to save the template files directly. If logged in, the system associates the purchase license with your account so you can download it again anytime.'
  },
  {
    question: 'Is the payment gateway secure?',
    answer: 'Yes. We utilize the official Razorpay Checkout API. All payment transactions, verification tokens, and card/UPI/banking transactions are securely processed and verified directly on Razorpay servers.'
  },
  {
    question: 'Can I use these templates for commercial client work?',
    answer: 'Absolutely. Once purchased, you receive a full developer license. You can customize, integrate, and deploy the templates for commercial client work, personal projects, or startups. However, reselling the template source code directly on other marketplaces is prohibited.'
  },
  {
    question: 'What is included in the downloaded codebase?',
    answer: 'You will receive a standard ZIP package containing all the template components, React/Next configuration setups, CSS style configs, mock data scripts, and a step-by-step README file explaining how to run the setup local environment, packages, and custom integrations.'
  },
  {
    question: 'Can I request a refund if I face issues?',
    answer: 'Since the products are digital source files, downloads are immediately unlocked and irrevocable. We do not support standard refunds, but we do provide developer support to resolve any bugs or setup issues you face.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="relative z-10 overflow-hidden">



      {/* Content sits above everything */}
      <div className="relative z-20 py-24 px-6">
        <div className="max-w-[800px] mx-auto">

          {/* Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-xs uppercase tracking-widest font-bold text-primary-indigo font-mono flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Got Questions?</span>
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">Frequently Asked Questions</h3>
            <p className="text-white/55 max-w-[500px] mx-auto mt-4 text-base">
              Find answers to licensing, downloads, and payments.
            </p>
          </motion.div>

          {/* Accordions */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                }
              }
            }}
            className="space-y-4"
          >
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: isOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: isOpen
                      ? '1px solid rgba(168,85,247,0.35)'
                      : '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {/* Trigger */}
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 text-white hover:text-primary-pink transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary-pink flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                  </button>

                  {/* Panel with Smooth Height transition */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        style={{ borderTop: '1px solid rgba(168,85,247,0.15)', overflow: "hidden" }}
                      >
                        <div className="p-6 text-sm text-white/60 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
