import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

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
    <section id="faqs" className="py-24 px-6 relative z-10 border-t border-white/5 bg-black/20">
      <div className="max-w-[800px] mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-purple-400 font-mono flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4.5 h-4.5" />
            <span>Got Questions?</span>
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">Frequently Asked Questions</h3>
          <p className="text-white/60 max-w-[500px] mx-auto mt-4 text-base">
            Find answers to licensing, downloads, and payments.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div 
                key={idx}
                className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 text-white hover:text-purple-300 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                  )}
                </button>

                {/* Accordion Panel */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 text-sm text-white/60 leading-relaxed bg-white/[0.01]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
