import { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

/** كل المنسّقات بتوقيت Asia/Amman وأرقام لاتينية للوضوح */
const dateFull = new Intl.DateTimeFormat("ar-JO-u-nu-latn", {
  timeZone: "Asia/Amman",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFull = new Intl.DateTimeFormat("ar-JO-u-nu-latn", {
  timeZone: "Asia/Amman",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});
const dateShort = new Intl.DateTimeFormat("ar-JO-u-nu-latn", {
  timeZone: "Asia/Amman",
  day: "numeric",
  month: "short",
});
const timeShort = new Intl.DateTimeFormat("ar-JO-u-nu-latn", {
  timeZone: "Asia/Amman",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export default function JordanClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), compact ? 30000 : 1000);
    return () => clearInterval(t);
  }, [compact]);

  if (compact) {
    return (
      <span className="flex items-center gap-1.5">
        <Clock className="size-3 text-nova-dust" />
        <span className="tabular-nums">{dateShort.format(now)} — {timeShort.format(now)}</span>
        <span className="text-white/30">بتوقيت عمّان</span>
      </span>
    );
  }

  return (
    <div className="flex w-fit flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl border border-white/10 bg-nova-deep/70 px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-white/65">
        <CalendarDays className="size-4 text-nova-dust" />
        {dateFull.format(now)}
      </span>
      <span className="hidden h-4 w-px bg-white/15 sm:block" />
      <span className="flex items-center gap-1.5 font-nova text-sm font-semibold tabular-nums tracking-wider text-white" dir="ltr">
        <Clock className="size-4 text-wa" />
        {timeFull.format(now)}
      </span>
      <span className="text-[10px] font-semibold text-white/35">توقيت الأردن (عمّان)</span>
    </div>
  );
}
