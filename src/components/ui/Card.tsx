import clsx from "clsx";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-2xl border border-gray-200 bg-white shadow-soft p-6 md:p-8", className)}>
      {children}
    </div>
  );
}
