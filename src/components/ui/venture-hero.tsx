import React from 'react';

interface VentureHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export const VentureHero = ({ title, subtitle, description }: VentureHeroProps) => {
  return (
    <div className="w-full py-20 relative bg-Color-Tokens-Background-Secondary flex flex-col justify-start items-start gap-24 overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="w-full h-[697px] absolute left-0 top-0 overflow-hidden pointer-events-none">
        <div className="w-80 h-72 absolute left-[531.84px] top-[26.05px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-80 h-72 absolute left-[337px] top-[721.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-80 h-72 absolute left-[1252.09px] top-[511.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-80 h-72 absolute left-[336.94px] top-[363.62px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-80 h-72 absolute left-[7.09px] top-[538.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-[556.88px] h-[662.65px] absolute left-[6px] top-[-190.86px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-[556.88px] h-[662.65px] absolute left-[1297.98px] top-[1026px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-[556.88px] h-[662.65px] absolute left-[1396.98px] top-[471px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        <div className="w-[556.88px] h-[662.65px] absolute left-[872.88px] top-[-86px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
      </div>

      {/* Gradient Overlays */}
      <div className="w-full h-36 absolute left-0 top-[466px] bg-gradient-to-b from-white/0 to-white pointer-events-none"></div>
      <div className="w-full h-36 absolute left-0 top-0 bg-gradient-to-b from-white/0 to-white pointer-events-none"></div>

      {/* Header */}
      <div className="w-full px-20 flex justify-between items-center relative z-10">
        <div className="flex justify-start items-center gap-5">
          <div className="w-11 h-9 relative">
            <div className="w-5 h-4 absolute left-[23.50px] top-0 bg-Color-Tokens-Content-Dark-Primary"></div>
            <div className="w-8 h-9 absolute left-0 top-0 bg-Color-Tokens-Content-Dark-Primary"></div>
          </div>
          <div className="text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-10">Venture</div>
        </div>
        <div className="text-right text-slate-950 text-2xl font-normal font-['Inter'] leading-loose">{subtitle}</div>
      </div>

      {/* Hero Content */}
      <div className="w-full px-20 flex flex-col justify-start items-center gap-12 relative z-10">
        <div className="w-full text-Color-Tokens-Content-Dark-Primary text-8xl font-medium font-['Inter'] leading-[96px]">{title}</div>
        <div className="w-full text-zinc-500 text-3xl font-normal font-['Inter'] leading-10">
          {description}
        </div>
      </div>
    </div>
  );
};
