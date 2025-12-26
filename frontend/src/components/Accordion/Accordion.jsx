import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-base-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-base-100 hover:bg-base-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="font-semibold text-left">{title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-4 bg-base-50">{children}</div>
      </div>
    </div>
  );
};

export const Accordion = ({ children, className = "" }) => {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
};

export default Accordion;
