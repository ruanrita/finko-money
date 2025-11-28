"use client";

interface InlineLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function InlineLoader({ text = "Carregando", size = "md" }: InlineLoaderProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer rotating circles */}
          <g className="animate-[spin_6s_linear_infinite] origin-center">
            <circle cx="50" cy="15" r="2.5" className="fill-brand">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="85" cy="50" r="2.5" className="fill-sky-400">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="85" r="2.5" className="fill-brand">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="15" cy="50" r="2.5" className="fill-sky-400">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Middle rotating ring */}
          <circle
            cx="50"
            cy="50"
            r="28"
            className="fill-none stroke-sky-400/30"
            strokeWidth="2"
            strokeDasharray="50 25"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Inner rotating ring (reverse) */}
          <circle
            cx="50"
            cy="50"
            r="23"
            className="fill-none stroke-brand/40"
            strokeWidth="2"
            strokeDasharray="35 18"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 50 50"
              to="0 50 50"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Center Logo Background */}
          <rect x="38" y="38" width="24" height="24" rx="5" className="fill-brand">
            <animate attributeName="opacity" values="1;0.75;1" dur="1.5s" repeatCount="indefinite" />
          </rect>

          {/* Wallet Icon (simplified) */}
          <g className="fill-white">
            <path d="M 44 44 L 44 47 L 41 47 L 41 53 L 44 53 L 44 56 L 59 56 L 59 44 Z M 46 49 L 57 49 L 57 52 L 46 52 Z">
              <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
            </path>
            <circle cx="55" cy="50.5" r="1.2" />
          </g>
        </svg>
      </div>

      {/* Animated Text */}
      <div className="flex items-center gap-1">
        <span className={`font-medium text-muted-foreground ${textSizeClasses[size]}`}>
          {text}
        </span>
        <div className="flex gap-0.5">
          <span className="animate-[bounce_1s_infinite_0ms] text-brand">.</span>
          <span className="animate-[bounce_1s_infinite_200ms] text-brand">.</span>
          <span className="animate-[bounce_1s_infinite_400ms] text-brand">.</span>
        </div>
      </div>
    </div>
  );
}
