import { useEffect, useState } from "react";
import { Gift, Sparkles, Timer } from "lucide-react";
import { LAUNCH_TS } from "../lib/data";

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, LAUNCH_TS - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

const UNITS: { key: string; label: string }[] = [
  { key: "days", label: "يوم" },
  { key: "hours", label: "ساعة" },
  { key: "minutes", label: "دقيقة" },
  { key: "seconds", label: "ثانية" },
];

export default function Countdown() {
  const cd = useCountdown();
  const values: Record<string, number> = {
    days: cd.days,
    hours: cd.hours,
    minutes: cd.minutes,
    seconds: cd.seconds,
  };

  return (
    <div className="card-nova relative overflow-hidden px-6 py-8 text-center sm:px-10">
      {/* توهج */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-nova-dust/10 blur-[90px]" />

      <div className="relative">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-nova-dust/40 px-4 py-1.5 text-xs font-bold text-nova-dust">
          <Timer className="size-3.5" />
          العد التنازلي للإطلاق الرسمي
        </div>

        {cd.done ? (
          <p className="mt-6 font-nova text-4xl font-semibold glow-text">أُطلقنا! تسوّق الآن</p>
        ) : (
          <div className="mt-7 flex items-stretch justify-center gap-3 sm:gap-5" dir="ltr">
            {UNITS.map((u, i) => (
              <div key={u.key} className="flex items-center gap-3 sm:gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-20 w-16 items-center justify-center rounded-2xl border border-white/15 bg-nova-purple/60 sm:h-24 sm:w-20">
                    <span className="glow-text font-nova text-4xl font-semibold tabular-nums sm:text-5xl">
                      {String(values[u.key]).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="mt-2 text-[11px] font-semibold text-white/55">{u.label}</span>
                </div>
                {i < UNITS.length - 1 && (
                  <span className="glow-text -mt-6 font-nova text-3xl font-semibold text-white/50">:</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* التاريخ */}
        <div className="mx-auto mt-7 h-px w-56 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <p className="mt-4 text-sm font-semibold text-white/80">
          الإطلاق الرسمي: الأحد ١ تشرين الثاني (نوفمبر) ٢٠٢٦ — الساعة ٧:٠٠ مساءً بتوقيت عمّان
        </p>

        {/* التشويق */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-white/65">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs">
            <Gift className="size-3.5 text-nova-dust" />
            هدايا مجانية لأول ١٠٠ طلب عند السابعة مساءً بالضبط
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs">
            <Sparkles className="size-3.5 text-nova-dust" />
            خصومات افتتاحية حتى ٥٠٪ لمدة ٢٤ ساعة فقط
          </span>
        </div>
      </div>
    </div>
  );
}
