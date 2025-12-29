import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 mb-16">
          {/* Company Info */}
          <div className="max-w-[300px]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 bg-[--color-text-primary] rounded-md flex items-center justify-center text-white font-black text-base">
                C
              </div>
              <div className="text-xl font-extrabold text-[--color-text-primary] tracking-tight">
                Codeket<span className="text-accent">Restaurant</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              Complete restaurant management system for modern eateries.
              Streamline orders, manage inventory, and delight customers.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-400 transition-all duration-200 p-2 border border-gray-200 rounded-lg hover:text-accent hover:border-accent"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Product
            </h4>
            <div className="flex flex-col gap-3">
              {["Features", "Pricing", "Help Docs", "Mobile App"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Company
            </h4>
            <div className="flex flex-col gap-3">
              {["About Codeket", "Our Services", "Contact Us"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="min-w-fit">
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:restaurant@codeket.com"
                className="flex items-center gap-3 text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
              >
                <Mail size={16} className="text-accent" />
                restaurant@codeket.com
              </a>
              <a
                href="tel:+2349063503232"
                className="flex items-center gap-3 text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
              >
                <Phone size={16} className="text-accent" />
                +234 906 350 3232
              </a>
              <div className="flex items-start gap-3 text-gray-500 text-sm font-semibold">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  New Ring Road, Kwado
                  <br />
                  Katsina, Nigeria 820101
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
          <div className="text-gray-400 text-[0.7rem] font-bold uppercase tracking-widest">
            © 2025 Codeket Ltd. All rights reserved.
          </div>

          <div className="flex gap-6 text-[0.7rem] font-bold uppercase tracking-widest">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 no-underline transition-colors hover:text-[--color-text-primary]"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
