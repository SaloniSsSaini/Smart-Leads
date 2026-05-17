import { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1200);
    const t2 = setTimeout(onFinish, 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 transition-opacity duration-400 ${fade ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <Logo size="lg" className="[&_span]:text-white [&_span_span]:text-indigo-200" />
      <p className="mt-4 text-sm font-medium tracking-widest text-indigo-200 uppercase">
        Lead Management CRM
      </p>
      <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-indigo-500/40">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-white/80" />
      </div>
    </div>
  );
};
