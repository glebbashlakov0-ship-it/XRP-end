import clsx from "clsx";

export default function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 h-11 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-900/15";
  const styles =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50";

  return <button className={clsx(base, styles, className)} {...props} />;
}
