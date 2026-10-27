import starsImg from "../assets/stars.jpg";

export default function Stars({ strong = false }: { strong?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-nova-space" aria-hidden>
      {/* صورة النجوم الحقيقية */}
      <img
        src={starsImg}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          strong ? "opacity-80" : "opacity-55"
        }`}
      />
      {/* طبقات نجوم CSS متحركة */}
      <div className="stars-a" />
      <div className="stars-b" />
      {/* توهجات سديمية خفيفة */}
      <div className="absolute -top-40 start-1/4 h-[500px] w-[500px] rounded-full bg-nova-purple/50 blur-[160px]" />
      <div className="absolute bottom-0 end-0 h-[420px] w-[420px] rounded-full bg-nova-dust/10 blur-[150px]" />
      {/* تعتيم تدريجي للقراءة */}
      <div className="absolute inset-0 bg-gradient-to-b from-nova-space/40 via-transparent to-nova-space/70" />
    </div>
  );
}
