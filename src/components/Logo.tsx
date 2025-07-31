import { Rocket } from "lucide-react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.location.reload()}
      className={`inline-flex cursor-pointer items-center gap-2 font-bold text-blue-600 ${className}`}
    >
      <Rocket className="w-6 h-6" />
      Performate
    </button>
  );
}
