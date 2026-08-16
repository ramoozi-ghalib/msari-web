'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface FooterAccordionProps {
  title: string;
  children: ReactNode;
}

export default function FooterAccordion({ title, children }: FooterAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-white font-black text-sm transition-colors hover:text-white/90"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`text-white/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '360px' : '0px' }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}
