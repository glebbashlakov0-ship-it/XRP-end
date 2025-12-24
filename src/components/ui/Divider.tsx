import clsx from "clsx";
export default function Divider({ className }: { className?: string }) {
  return <div className={clsx("h-px w-full bg-gray-200", className)} />;
}
