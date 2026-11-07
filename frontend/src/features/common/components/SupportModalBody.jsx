import React from "react";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const SupportModalBody = ({ closeModal }) => {
  const contactOptions = [
    {
      title: "WhatsApp",
      description: "Direct chat with a human. Replies instantly.",
      icon: ChatBubbleLeftRightIcon,
      action: () => window.open("https://wa.me/", "_blank"),
      color: "text-green-500",
      bg: "bg-green-500/10",
      hover: "hover:bg-green-500/20",
    },
    {
      title: "Email Support",
      description: "For formal inquiries and business requests.",
      icon: EnvelopeIcon,
      action: () => (window.location.href = "mailto:restaurant@"),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hover: "hover:bg-blue-500/20",
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactOptions.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={option.action}
            className={`flex flex-col items-center text-center p-8 rounded-[32px] border border-base-content/5 bg-base-100 shadow-sm ${option.hover} transition-all duration-300 group`}
          >
            <div
              className={`w-16 h-16 ${option.bg} rounded-2xl flex items-center justify-center mb-6 ring-1 ring-base-content/5 group-hover:scale-110 transition-transform duration-500`}
            >
              <option.icon className={`w-8 h-8 ${option.color}`} />
            </div>
            <h3 className="text-xl font-extrabold text-base-content mb-2 tracking-tight">
              {option.title}
            </h3>
            <p className="text-base-content/60 text-sm font-medium leading-relaxed">
              {option.description}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-base-content/40 text-xs font-bold uppercase tracking-widest leading-loose">
          24/7 Operational Support Hub
          <br />
          Restaurant POS Restaurant Operations
        </p>
      </div>

      <div className="modal-action mt-8 flex justify-center">
        <button
          className="btn btn-ghost hover:bg-base-200 rounded-full px-8 text-base-content/60 hover:text-base-content transition-colors capitalize font-bold"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SupportModalBody;
