// frontend/src/features/home/components/Testimonials.jsx
import React from "react";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Owner, Tasty Bites Café",
      image: "/testimonials/sarah.jpg",
      rating: 5,
      text: "Since implementing Codeket Restaurant, our order accuracy improved by 95% and table turnover increased by 30%. The kitchen display system eliminated all the confusion. Best investment we've made!",
    },
    {
      name: "Michael Chen",
      role: "Manager, Quick Grill Express",
      image: "/testimonials/michael.jpg",
      rating: 5,
      text: "We run 3 locations and this system makes multi-site management effortless. Real-time sales data helps us make quick decisions. Our food costs dropped 18% in the first two months!",
    },
    {
      name: "Aisha Mohammed",
      role: "Owner, Fresh Eats Restaurant",
      image: "/testimonials/aisha.jpg",
      rating: 5,
      text: "The mobile POS changed everything for us. Our servers take orders tableside, and customers love the faster service. We've increased our daily covers by 40% without hiring more staff!",
    },
    {
      name: "David Thompson",
      role: "Owner, Café Delight",
      image: "/testimonials/david.jpg",
      rating: 5,
      text: "Setup was incredibly easy. We were taking orders on day one! The inventory alerts save us from running out of popular items. Customer support is amazing - they're always there when we need help.",
    },
    {
      name: "Fatima Ahmed",
      role: "Manager, Spice Junction",
      image: "/testimonials/fatima.jpg",
      rating: 5,
      text: "The analytics dashboard gives us insights we never had before. We now know our peak hours, best-selling items, and staff performance. It's like having a business consultant built into the software!",
    },
    {
      name: "James Wilson",
      role: "Owner, Wilson's Diner",
      image: "/testimonials/james.jpg",
      rating: 5,
      text: "After 20 years running restaurants the old way, I was skeptical. But this system paid for itself in 3 weeks through reduced waste and faster service. Wish I'd switched years ago!",
    },
  ];

  return (
    <div
      className="py-20 bg-gradient-to-b from-base-200 to-base-100"
      id="testimonials"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <Star className="w-4 h-4 fill-current" />
            Success Stories
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-base-content">
            Loved by Restaurant
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Owners Nationwide
            </span>
          </h2>

          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Join hundreds of successful restaurants that have transformed their
            operations and increased profits with our system.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-base-100/70 backdrop-blur-xl border border-base-content/10 p-6 lg:p-8 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 bg-primary/10 p-3 rounded-full border border-primary/20">
                <Quote className="w-6 h-6 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-base-content/80 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-base-content/10">
                <div className="avatar placeholder">
                  <div className="bg-primary/10 text-primary rounded-full w-12 h-12">
                    <span className="text-xl font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-base-content">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-base-content/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-base to-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              500+
            </div>
            <div className="text-sm lg:text-base text-base-content/70">
              Active Restaurants
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              4.9/5
            </div>
            <div className="text-sm lg:text-base text-base-content/70">
              Average Rating
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              2M+
            </div>
            <div className="text-sm lg:text-base text-base-content/70">
              Orders Processed
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              98%
            </div>
            <div className="text-sm lg:text-base text-base-content/70">
              Would Recommend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
