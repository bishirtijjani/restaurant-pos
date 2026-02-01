import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  MessageCircle,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export default function Footer({ onContactClick }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr_1.5fr] gap-12 mb-16">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 bg-[--color-text-primary] rounded-md flex items-center justify-center text-white font-black text-base">
                C
              </div>
              <div className="text-xl font-extrabold text-[--color-text-primary] tracking-tight">
                Codeket<span className="text-accent">Restaurant</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium max-w-[350px]">
              The operations-first backbone for serious restaurants. Designed to
              power efficient kitchens and seamless guest experiences across all
              restaurant operations
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "https://x.com/codeketofficial" },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/company/codeket",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-all duration-200 p-2 border border-gray-200 rounded-lg hover:text-accent hover:border-accent"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { name: "Features", href: "#flow" },
                { name: "Pricing", href: "#pricing" },
                { name: "Founding Partner", href: "#founding-partners" },
                { name: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary] flex items-center gap-2"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Company
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://codeket.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary] text-left hover:cursor-pointer"
              >
                Company
              </a>
              {["Global Support", "Contact Us"].map((item) => (
                <button
                  key={item}
                  onClick={onContactClick}
                  className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary] text-left hover:cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & WhatsApp */}
          <div className="min-w-fit">
            <h4 className="text-sm font-extrabold text-[--color-text-primary] uppercase tracking-widest mb-6">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:restaurant@codeket.com"
                className="flex items-center gap-3 text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Mail size={16} />
                </div>
                restaurant@codeket.com
              </a>

              <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <span>Founder Direct Line (24/7)</span>
              </div>

              {/* Enticing WhatsApp Button */}
              <a
                href="https://wa.me/2349063503232"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-2 flex items-center gap-4 p-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[#25D366]/30 overflow-hidden"
              >
                {/* Pulse Effect */}
                <span className="absolute inset-0 w-full h-full bg-white/20 animate-[ping_3s_infinite] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-2 bg-white/20 rounded-lg">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.117-1.605a11.81 11.81 0 005.925 1.577h.005c6.632 0 12.032-5.4 12.035-12.034a11.777 11.777 0 00-3.614-8.504" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1">
                    No Bots • Replies Instantly
                  </span>
                  <span className="text-sm font-black leading-none">
                    Founder Direct Chat
                  </span>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
          <div className="text-gray-400 text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-gray-300" />© {currentYear}{" "}
            Codeket Ltd. All rights reserved.
          </div>

          <div className="flex gap-6 text-[0.7rem] font-bold uppercase tracking-widest">
            {[
              {
                name: "Privacy Policy",
                href: "https://codeket.com/privacy-policy",
              },
              {
                name: "Terms of Service",
                href: "https://codeket.com/terms-of-service",
              },
              {
                name: "Cookie Policy",
                href: "https://codeket.com/cookie-policy",
              },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 no-underline transition-colors hover:text-[--color-text-primary]"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
