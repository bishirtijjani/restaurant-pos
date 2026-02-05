import React from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { openModal } from "../../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";

const SupportLink = () => {
  const dispatch = useDispatch();

  const handleOpenSupport = (e) => {
    e.preventDefault();
    dispatch(
      openModal({
        title: "Get Help",
        bodyType: MODAL_BODY_TYPES.SUPPORT_MODAL,
        size: "lg",
      }),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, type: "spring" }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <button
        onClick={handleOpenSupport}
        className="group relative flex items-center justify-center cursor-pointer"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full scale-110 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Label (Desktop) */}
        <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl whitespace-nowrap shadow-2xl">
            <span className="text-sm font-bold text-white tracking-wide">
              Get Help
            </span>
          </div>
        </div>

        {/* Main Button */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 bg-green-600 backdrop-blur-xl border border-green-500/50 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-500 hover:scale-105 transition-all duration-500 group-active:scale-95">
          <ChatBubbleLeftRightIcon className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:scale-110 transition-transform duration-500" />

          {/* Notification Badge Dot */}
          <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full border-2 border-green-600 animate-pulse" />
        </div>
      </button>
    </motion.div>
  );
};

export default SupportLink;
