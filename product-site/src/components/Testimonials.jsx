import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "Founder, Lotus Garden",
      text: "We switched from Toast. The $3,000 upfront saving was great, but the lack of 'software tax' on every sale is what's actually changing our business.",
      rating: 5,
    },
    {
      name: "Marcus Miller",
      role: "Ops Director, Burger Lab",
      text: "Codeket doesn't crash during the Friday rush. That's all I cared about. The fact that I can use my existing iPads was a huge bonus.",
      rating: 5,
    },
  ];

  return (
    <section className="section bg-gray-50 border-t border-b border-gray-200">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="lg:w-1/3">
            <div className="mb-4">
              <span className="badge">Operator Proof</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-[--color-text-primary] leading-tight">
              Built for the <br className="hidden lg:block" /> Friday rush.
            </h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              We don't do marketing fluff. We talk to operators who need systems
              that work under pressure.
            </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card bg-white p-10 flex flex-col items-start relative overflow-hidden group hover:border-accent"
              >
                <Quote
                  className="absolute top-6 right-8 text-gray-50 opacity-10 group-hover:text-accent group-hover:opacity-20 transition-all"
                  size={80}
                />

                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-accent text-accent"
                    />
                  ))}
                </div>

                <p className="text-lg text-[--color-text-primary] font-bold leading-relaxed mb-10 relative z-10 italic">
                  "{review.text}"
                </p>

                <div className="mt-auto">
                  <div className="font-extrabold text-[--color-text-primary] tracking-tight">
                    {review.name}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {review.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
