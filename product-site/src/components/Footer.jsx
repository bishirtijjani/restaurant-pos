import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  MessageCircle,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export default function Footer() {
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
              The operations-first backbone for serious restaurants. Powering
              efficient kitchens and seamless guest experiences across the{" "}
              <span className="text-[--color-text-primary] font-bold">
                United States, UK, UAE, and Australia.
              </span>
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
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              {[
                "Features",
                "Pricing",
                "System Status",
                "API Reference",
                "Security",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary] flex items-center gap-2"
                >
                  {item === "System Status" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                  {item}
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
              {["About", "Global Support", "Contact Us", "Trust Center"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-500 no-underline text-sm font-semibold transition-colors hover:text-[--color-text-primary]"
                  >
                    {item}
                  </a>
                ),
              )}
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
                <span>+1 (650) 456-0199 (Global Sales)</span>
              </div>

              {/* Enticing WhatsApp Button */}
              <a
                href="https://wa.me/your-whatsapp-number-here"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-2 flex items-center gap-4 p-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[#25D366]/30 overflow-hidden"
              >
                {/* Pulse Effect */}
                <span className="absolute inset-0 w-full h-full bg-white/20 animate-[ping_3s_infinite] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageCircle size={20} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1">
                    Instant Connect
                  </span>
                  <span className="text-sm font-black leading-none">
                    Chat with an Expert
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
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 no-underline transition-colors hover:text-[--color-text-primary]"
                >
                  {link}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
