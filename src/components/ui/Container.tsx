import clsx from "clsx";

export default function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("mx-auto w-full max-w-none px-5 md:px-8", className)}>
      {children}
    </div>
  );
}
