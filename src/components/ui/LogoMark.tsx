import Image from "next/image";

export default function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center bg-white">
        <Image src="/logo-placeholder.svg" alt="XRP Restaking logo" width={20} height={20} />
      </div>
      <span className="font-semibold tracking-tight">XRP Restaking</span>
    </div>
  );
}
