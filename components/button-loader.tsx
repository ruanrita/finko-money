"use client";

interface ButtonLoaderProps {
  size?: "sm" | "md";
}

export function ButtonLoader({ size = "md" }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  return (
    <div className={`inline-block ${sizeClasses[size]}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer rotating ring */}
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-none stroke-current opacity-25"
          strokeWidth="2"
        />

        {/* Animated rotating arc */}
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-none stroke-current"
          strokeWidth="2"
          strokeDasharray="15 45"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Center logo icon */}
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          className="fill-current"
        >
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Wallet detail (simplified) */}
        <rect
          x="10"
          y="11"
          width="4"
          height="2"
          className="fill-white dark:fill-zinc-900"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  );
}
