import React from 'react';

interface OfficialLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  size = 44,
  showText = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-2 shadow-sm ring-1 ring-blue-700/40 text-amber-400"
        style={{ width: size, height: size }}
      >
        {/* Crisp vector emblem representing Indonesian water resources (dam, flow, gear) */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="45" stroke="#f59e0b" strokeWidth="3" opacity="0.9" />
          <circle cx="50" cy="50" r="41" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          
          {/* Dam structure / engineering pylons */}
          <path
            d="M28 35 L38 65 L62 65 L72 35 Z"
            fill="#1e293b"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <path d="M38 42 L62 42" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M42 50 L58 50" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M50 35 L50 65" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Water waves */}
          <path
            d="M20 68 C 30 63, 40 73, 50 68 C 60 63, 70 73, 80 68"
            stroke="#38bdf8"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M23 76 C 33 71, 43 81, 53 76 C 63 71, 73 81, 78 76"
            stroke="#60a5fa"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M27 83 C 35 79, 45 87, 55 83 C 65 79, 70 85, 74 83"
            stroke="#93c5fd"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Golden star / crest at the top */}
          <polygon
            points="50,16 52.5,23 60,23 54,27.5 56,34 50,29.5 44,34 46,27.5 40,23 47.5,23"
            fill="#f59e0b"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Direktorat PPISDA
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Direktorat Pelaksanaan Pembiayaan Infrastruktur SDA
          </span>
        </div>
      )}
    </div>
  );
};
