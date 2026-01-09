import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const appUrl = "https://app.restaurant.codeket.com";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Pricing", href: "#pricing" },
    { name: "Help Docs", href: "#" },
  ];

  return (
    <>
      <header
        className={`fixed left-1/2 -translate-x-1/2 w-[92%] max-w-[1200px] z-[1000] backdrop-blur-lg border border-gray-200 rounded-[100px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
          scrolled
            ? "top-4 bg-white/95 py-2 px-6 shadow-lg"
            : "top-6 bg-white/80 py-3 px-8 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center w-full gap-6">
          {/* Logo Group */}
          <a href="/" className="flex items-center gap-3 shrink-0 no-underline">
            <div className="w-9 h-9 bg-accent flex items-center justify-center text-white rounded-full shadow-sm font-black text-xl">
              C
            </div>
            <div className="text-[1.2rem] font-extrabold tracking-tight text-[--color-text-primary] hidden md:block">
              Codeket<span className="text-accent">Restaurant</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[0.9rem] font-semibold text-gray-500 hover:text-[--color-text-primary] transition-colors duration-200 no-underline tracking-tighter"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex gap-4 items-center shrink-0">
            <a
              href={`${appUrl}/login`}
              className="hidden md:block text-[0.9rem] font-bold text-[--color-text-primary] no-underline mr-2"
            >
              Log In
            </a>

            <a
              href={`${appUrl}/register`}
              className="btn btn-primary !px-6 !py-2.5 !text-[0.85rem] ring-offset-2 focus:ring-2 focus:ring-accent"
            >
              Get Started
            </a>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden bg-gray-50 border border-gray-200 rounded-xl p-2 cursor-pointer text-[--color-text-primary] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 w-full h-screen bg-white z-[999] p-32 px-8 pb-12 flex flex-col gap-12"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-extrabold text-[--color-text-primary] no-underline tracking-tighter"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <a
                href={`${appUrl}/login`}
                className="p-5 text-center text-[1.2rem] font-extrabold text-[--color-text-primary] no-underline bg-gray-50 rounded-2xl border border-gray-200"
              >
                Log In
              </a>
              <a
                href={`${appUrl}/register`}
                className="btn btn-primary p-5 text-[1.2rem] font-extrabold rounded-2xl flex justify-center !w-full"
              >
                Start Free Trial
                <ArrowRight size={22} className="ml-2" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
