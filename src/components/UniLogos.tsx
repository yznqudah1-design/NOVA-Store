/** شعارات الجامعات الأردنية الشريكة — توصيل مجاني */

export function JUSTLogo({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-label="جامعة العلوم والتكنولوجيا الأردنية">
      <circle cx="48" cy="48" r="45" fill="#0b3d2e" stroke="#c9b896" strokeWidth="2.5" />
      <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeDasharray="3 3" />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize="22"
        fill="#ffffff"
        style={{ letterSpacing: "1px" }}
      >
        JUST
      </text>
      <text x="48" y="66" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontWeight="700" fontSize="8.5" fill="#c9b896">
        العلوم والتكنولوجيا
      </text>
      <text x="48" y="30" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontWeight="700" fontSize="7" fill="rgba(255,255,255,.7)">
        إربد — الأردن
      </text>
    </svg>
  );
}

export function YULogo({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-label="جامعة اليرموك">
      <circle cx="48" cy="48" r="45" fill="#1c2a52" stroke="#c9b896" strokeWidth="2.5" />
      <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeDasharray="3 3" />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="#ffffff"
        style={{ letterSpacing: "1px" }}
      >
        YU
      </text>
      <text x="48" y="66" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontWeight="700" fontSize="9" fill="#c9b896">
        جامعة اليرموك
      </text>
      <text x="48" y="30" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontWeight="700" fontSize="7" fill="rgba(255,255,255,.7)">
        إربد — الأردن
      </text>
    </svg>
  );
}
