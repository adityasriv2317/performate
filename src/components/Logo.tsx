import { Rocket } from 'lucide-react';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold text-blue-600 text-xl ${className}`}>
      <Rocket className="w-6 h-6" />
      Performate
    </span>
  );
}
