import { motion } from "framer-motion";
import { Quote, MessageSquareQuote } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "Founder, Lotus Garden",
      text: "We switched from Toast. The $3,000 upfront saving was great, but the lack of 'software tax' on every sale is what's actually changing our business.",
      location: "San Francisco, CA",
    },
    {
      name: "Marcus Miller",
      role: "Ops Director, Burger Lab",
      text: "Codeket doesn't crash during the Friday rush. That's all I cared about. The fact that I can use my existing iPads was a huge bonus.",
      location: "Austin, TX",
    },
  ];

  return (
    <section
      className="relative py-24 bg-white overflow-hidden"
      id="testimonials"
    >
      <div className="container relative z-10 px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-full mb-6"
          >
            <MessageSquareQuote size={14} className="text-accent" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white">
              Operator Proof
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            Built for the <br />
            <span className="text-accent">Friday rush.</span>
          </h2>

          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            We don't do marketing fluff. We talk to operators who need systems
            that work under pressure.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative p-12 bg-slate-50/50 rounded-[48px] border border-slate-100 hover:border-accent/30 hover:bg-white hover:shadow-2xl hover:shadow-accent/5 transition-all duration-700 overflow-hidden"
            >
              {/* Subtle Technical Pattern */}
              <div className="absolute inset-x-0 bottom-0 h-32 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px]" />

              <div className="relative z-10">
                <div className="mb-10 flex items-center justify-between">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                    <Quote size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
                      Verified Case Study
                    </span>
                    <span className="text-[0.65rem] font-bold text-slate-900 mt-1">
                      {review.location}
                    </span>
                  </div>
                </div>

                <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-[1.3] mb-12 tracking-tight">
                  "{review.text}"
                </p>

                <div className="flex items-center gap-5 pt-8 border-t border-slate-200/60">
                  <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-500 text-xl">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900 leading-none mb-1">
                      {review.name}
                    </div>
                    <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {review.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Glow */}
              <div className="absolute top-0 right-0 w-32 h-1 bg-slate-100 group-hover:bg-accent transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
