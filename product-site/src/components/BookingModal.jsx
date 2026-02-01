import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import {
  X,
  MessageCircle,
  Mail,
  Send,
  Package,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
  const form = useRef();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setMessage("");
      setIsSent(false);
    }
  }, [isOpen]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    // Using placeholder values if env vars are missing, though recommended to set them up
    // The user mentioned import.meta.env values - I'll keep them as placeholders for now
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_id";
    const templateID =
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_id";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "public_key";

    const fullMessage = selectedPlan
      ? `
      Selected Plan: ${selectedPlan}
      ---------------------------------
      ${message || "No additional message."}
    `
      : message;

    const templateParams = {
      from_name: name,
      from_email: email,
      to_name: "Codeket Restaurant",
      message: fullMessage,
      selected_plan: selectedPlan || "Not specified",
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey).then(
      () => {
        setIsSending(false);
        setIsSent(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      },
      (error) => {
        setIsSending(false);
        console.error("FAILED...", error);
        alert("Failed to send message. Please try again later.");
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[40px] shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-full transition-all border border-gray-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                {selectedPlan ? `Booking: ${selectedPlan}` : "Connect With Us"}
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                Choose your preferred way to launch your operations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-stretch">
              {/* WhatsApp Option */}
              <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center border border-slate-100 group hover:border-accent/20 transition-all">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] mb-6">
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.117-1.605a11.81 11.81 0 005.925 1.577h.005c6.632 0 12.032-5.4 12.035-12.034a11.777 11.777 0 00-3.614-8.504" />
                  </svg>
                </div>
                <h4 className="font-extrabold text-2xl mb-3 text-slate-900 tracking-tight">
                  Chat on WhatsApp
                </h4>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  No bots. Real humans reply instantly. Get instant answers and
                  discuss your setup directly with the founding team.
                </p>
                <a
                  href={`https://wa.me/2349063503232?text=${encodeURIComponent(
                    `Hello! I'm interested in Codeket Restaurant ${
                      selectedPlan || "operations"
                    }.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-8 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 no-underline mt-auto"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.117-1.605a11.81 11.81 0 005.925 1.577h.005c6.632 0 12.032-5.4 12.035-12.034a11.777 11.777 0 00-3.614-8.504" />
                  </svg>
                  Start Instant Chat
                </a>
              </div>

              {/* Email Form Option */}
              <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center border border-slate-100 group hover:border-accent/20 transition-all">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                  <Mail size={32} />
                </div>
                <h4 className="font-extrabold text-2xl mb-3 text-slate-900 tracking-tight">
                  Send a Message
                </h4>

                {isSent ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl w-full h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
                      <Package size={24} />
                    </div>
                    <h5 className="font-black text-2xl text-emerald-900 mb-2">
                      Message Received!
                    </h5>
                    <p className="text-emerald-700 font-medium">
                      We'll get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form
                    ref={form}
                    onSubmit={handleEmailSubmit}
                    className="w-full space-y-4"
                  >
                    <input
                      type="text"
                      name="from_name"
                      placeholder="Your Name"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-semibold outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      name="from_email"
                      placeholder="Your Email"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-semibold outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <textarea
                      name="message"
                      placeholder={
                        selectedPlan
                          ? `Tell us about your restaurant (optional)`
                          : "Your Message"
                      }
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-semibold outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all h-32 text-sm resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required={!selectedPlan}
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full py-4 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {isSending ? "Processing..." : "Submit Request"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="mt-12 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              Real People. Real Operational Support.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
