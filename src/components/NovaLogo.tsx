export default function NovaLogo({ size = 160 }: { size?: number }) {
  return (
    <svg
      width={size}
      viewBox="0 0 380 160"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]"
      role="img"
      aria-label="NOVA STORE"
    >
      {/* المدار البيضاوي */}
      <ellipse
        cx="190"
        cy="80"
        rx="155"
        ry="58"
        fill="none"
        stroke="black"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* نجمة فوق */}
      <g transform="translate(190, 14)">
        <path
          d="M0,-14 L3.5,-3.5 L14,0 L3.5,3.5 L0,14 L-3.5,3.5 L-14,0 L-3.5,-3.5 Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
        />
      </g>
      {/* نجمة تحت */}
      <g transform="translate(190, 146)">
        <path
          d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
        />
      </g>
      {/* NOVA */}
      <text
        x="190"
        y="85"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize="72"
        fill="white"
        stroke="black"
        strokeWidth="10"
        strokeLinejoin="round"
        paintOrder="stroke"
        style={{ letterSpacing: "2px" }}
      >
        NOVA
      </text>
      {/* STORE */}
      <text
        x="190"
        y="118"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="600"
        fontSize="30"
        fill="white"
        stroke="black"
        strokeWidth="7"
        strokeLinejoin="round"
        paintOrder="stroke"
        style={{ letterSpacing: "1px" }}
      >
        STORE
      </text>
    </svg>
  );
}
