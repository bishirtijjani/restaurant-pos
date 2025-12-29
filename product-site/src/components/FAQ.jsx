import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is there really no setup fee?",
      a: "None. We believe your software should be an investment in growth, not a barrier to entry. You can be live in 15 minutes.",
    },
    {
      q: "Can I use my existing hardware?",
      a: "Yes. Codeket runs on any tablet (iPad, Android) or browser. No proprietary hardware lock-in or forced expensive terminal upgrades.",
    },
    {
      q: "How does the offline mode work?",
      a: "Our local-first architecture stores all transaction data in your browser's persistent storage. If the internet fails, everything keeps running. Once the connection is restored, it automatically syncs with your core database.",
    },
    {
      q: "What kind of support do I get?",
      a: "Every pilot customer gets direct access to the founding team. You get a direct line for WhatsApp or calls. We don't do ticket waitlists.",
    },
  ];

  return (
    <section className="section bg-white py-24" id="faq">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <div className="mb-4">
              <span className="badge">Knowledge Base</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-[--color-text-primary] leading-tight">
              Common <br className="hidden lg:block" /> Questions.
            </h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Everything you need to know about the system, technology, and
              operations.
            </p>
          </div>

          <div className="lg:w-2/3 space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-2xl transition-all duration-300 ${
                  openIndex === i
                    ? "border-accent bg-orange-50/10 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center group cursor-pointer"
                >
                  <span
                    className={`text-lg font-extrabold tracking-tight transition-colors ${
                      openIndex === i
                        ? "text-[--color-text-primary]"
                        : "text-gray-600 group-hover:text-[--color-text-primary]"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`p-2 rounded-full transition-colors ${
                      openIndex === i
                        ? "bg-accent text-white"
                        : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                    }`}
                  >
                    {openIndex === i ? (
                      <Minus size={18} strokeWidth={3} />
                    ) : (
                      <Plus size={18} strokeWidth={3} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-500 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
