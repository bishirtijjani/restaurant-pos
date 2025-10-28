import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { X, MessageCircle, Mail, Send, Package } from "lucide-react";

const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
  if (!isOpen) return null;

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

    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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
      to_name: "Codeket Virtual Tours",
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
        console.log("FAILED...", error.text);
        alert("Failed to send message. Please try again later.");
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="modal-box rounded-3xl shadow-2xl border border-base-300/20 max-w-4xl w-full p-8 ">
        <button
          onClick={onClose}
          className="btn btn-md btn-circle btn-outline absolute top-4 right-4 text-base-content/60 z-[1000]"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-4xl mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {selectedPlan
            ? `Booking: ${selectedPlan} Plan`
            : "Book Your Walkthrough"}
        </h3>
        <p className="text-center text-base-content/70 mb-8">
          {selectedPlan
            ? "Fill out the form below or contact us directly."
            : "Choose your preferred way to connect with us."}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8 relative">
          {/* WhatsApp Option */}
          <div className="bg-base-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-base-300/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <MessageCircle className="w-12 h-12 text-green-500 mb-4" />
            <h4 className="font-bold text-xl mb-2">Chat on WhatsApp</h4>
            <p className="text-base-content/70 mb-4">
              Get instant answers and discuss your project directly.
            </p>
            <a
              href={`https://wa.me/2349063503232?text=${encodeURIComponent(
                `Hello! I'm interested in the codeket virtual tours ${
                  selectedPlan || "general"
                } plan.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success btn-lg px-8 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chat
            </a>
          </div>

          {/* OR Separator - Different positioning for mobile vs desktop */}
          <div className="absolute inset-0 items-center justify-center pointer-events-none hidden md:flex">
            <span className="bg-base-100 px-4 text-base-content/50 font-bold rounded-full shadow-lg z-10">
              OR
            </span>
          </div>

          {/* Mobile OR Separator */}
          <div className="flex items-center justify-center py-4 md:hidden">
            <span className="bg-base-100 px-4 text-base-content/50 font-bold rounded-full shadow-lg">
              OR
            </span>
          </div>

          {/* Email Form Option */}
          <div className="bg-base-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-base-300/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <Mail className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="font-bold text-xl mb-2">Send a Message</h4>
            {isSent ? (
              <div className="text-center">
                <h5 className="font-bold text-2xl text-success mb-2">
                  Message Sent!
                </h5>
                <p>We'll get back to you shortly.</p>
              </div>
            ) : (
              <>
                <p className="text-base-content/70 mb-4">
                  Fill out the form below and we'll get back to you shortly.
                </p>
                <form
                  ref={form}
                  onSubmit={handleEmailSubmit}
                  className="w-full space-y-4"
                >
                  {selectedPlan && (
                    <div className="form-control">
                      <div className="input input-bordered w-full bg-base-100 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <span className="font-semibold">
                          {selectedPlan} Plan
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    name="from_name"
                    placeholder="Your Name"
                    className="input input-bordered w-full bg-base-100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    name="from_email"
                    placeholder="Your Email"
                    className="input input-bordered w-full bg-base-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <textarea
                    name="message"
                    placeholder={
                      selectedPlan
                        ? "Optional: anything else you'd like to add?"
                        : "Your Message"
                    }
                    className="textarea textarea-bordered w-full bg-base-100 h-32"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required={!selectedPlan}
                  ></textarea>
                  <button
                    type="submit"
                    className="btn btn-info btn-lg px-8 shadow-md hover:shadow-xl transition-all duration-300 w-full"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isSending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
