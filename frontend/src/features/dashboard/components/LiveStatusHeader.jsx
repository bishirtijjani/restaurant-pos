import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const LiveStatusHeader = () => {
  const [now, setNow] = useState(new Date());
  const { activeStore } = useSelector((state) => state.commonStore);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </div>
          <span className="text-xs font-bold text-success uppercase tracking-widest">
            Live Feed
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-base-content">
          Dashboard
        </h1>
        <p className="text-base-content/60 font-medium mt-1">
          {activeStore?.name || "Global Overview"} •{" "}
          {format(now, "eeee, MMMM do")}
        </p>
      </div>

      <div className="bg-base-100 px-4 md:px-6 py-2 md:py-3 rounded-xl md:2xl shadow-sm border border-base-200 flex flex-col items-start md:items-end">
        <span className="text-xl md:text-2xl font-mono font-bold text-primary tabular-nums">
          {format(now, "HH:mm:ss")}
        </span>
        <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
          Server Standard Time
        </span>
      </div>
    </div>
  );
};

export default LiveStatusHeader;
