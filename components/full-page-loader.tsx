"use client";

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        {/* SVG Animated Logo */}
        <div className="relative w-32 h-32">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer rotating circles */}
            <g className="animate-[spin_8s_linear_infinite] origin-center">
              <circle
                cx="50"
                cy="10"
                r="3"
                className="fill-brand"
              >
                <animate
                  attributeName="opacity"
                  values="1;0.3;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="90"
                cy="50"
                r="3"
                className="fill-sky-400"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="50"
                cy="90"
                r="3"
                className="fill-brand"
              >
                <animate
                  attributeName="opacity"
                  values="1;0.3;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="10"
                cy="50"
                r="3"
                className="fill-sky-400"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* Pulsing outer ring */}
            <circle
              cx="50"
              cy="50"
              r="35"
              className="fill-none stroke-brand/20"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="35;40;35"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.2;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Middle rotating ring */}
            <circle
              cx="50"
              cy="50"
              r="30"
              className="fill-none stroke-sky-400/30"
              strokeWidth="2"
              strokeDasharray="60 30"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Inner rotating ring (reverse) */}
            <circle
              cx="50"
              cy="50"
              r="25"
              className="fill-none stroke-brand/40"
              strokeWidth="2"
              strokeDasharray="40 20"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 50 50"
                to="0 50 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Center Logo Background */}
            <rect
              x="35"
              y="35"
              width="30"
              height="30"
              rx="6"
              className="fill-brand"
            >
              <animate
                attributeName="opacity"
                values="1;0.8;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Wallet Icon (simplified) */}
            <g className="fill-white">
              <path d="M 42 42 L 42 46 L 38 46 L 38 54 L 42 54 L 42 58 L 62 58 L 62 42 Z M 45 48 L 59 48 L 59 52 L 45 52 Z">
                <animate
                  attributeName="opacity"
                  values="1;0.7;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              <circle cx="56" cy="50" r="1.5" />
            </g>
          </svg>
        </div>

        {/* Animated Text */}
        <div className="space-y-3 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-brand to-sky-500 bg-clip-text text-transparent">
            FinkoMoney
          </h3>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">Carregando</span>
            <div className="flex gap-1">
              <span className="animate-[bounce_1s_infinite_0ms] text-brand">.</span>
              <span className="animate-[bounce_1s_infinite_200ms] text-brand">.</span>
              <span className="animate-[bounce_1s_infinite_400ms] text-brand">.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
