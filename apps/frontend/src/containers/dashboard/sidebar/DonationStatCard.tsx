type DonationStatCardProps = {
  iconSrc: string;
  iconAlt: string;
  label: string;
  value: string;
};

export default function DonationStatCard({
  iconSrc,
  iconAlt,
  label,
  value,
}: DonationStatCardProps) {
  return (
    <article className="rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-3">
      <div className="mb-4 flex items-center gap-2 text-[#737373]">
        <img src={iconSrc} alt={iconAlt} className="h-10 w-10" />
        <span className="text-[22px] leading-7 font-normal">{label}</span>
      </div>
      <p className="text-[36px] leading-9 font-semibold tracking-[-0.72px] text-black">
        {value}
      </p>
    </article>
  );
}
