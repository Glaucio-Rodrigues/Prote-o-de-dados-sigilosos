import { Scale } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#1e293b] h-16 flex items-center px-8 w-full">
      <div className="flex items-center gap-2 text-white">
        <Scale size={28} />
        <span className="font-semibold text-xl tracking-tight">Advocacia<span className="font-light">Docs</span></span>
      </div>
    </header>
  );
}
