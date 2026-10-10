export default function ProgressBar({
  percent,
  colorClass = 'bg-brand',
  heightClass = 'h-2',
}: {
  percent: number;
  colorClass?: string;
  heightClass?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-surface-muted ${heightClass}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
