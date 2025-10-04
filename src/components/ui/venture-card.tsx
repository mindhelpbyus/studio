import React from 'react';

export interface VentureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const VentureCard = ({
  title,
  description,
  children,
  className = '',
}: VentureCardProps) => {
  return (
    <div className={`self-stretch inline-flex justify-between items-start ${className}`}>
      <div className="w-[694px] inline-flex flex-col justify-start items-start gap-3">
        <div className="self-stretch justify-start text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-loose">
          {title}
        </div>
        <div className="self-stretch justify-start text-zinc-500 text-lg font-normal font-['Inter'] leading-relaxed">
          {description}
        </div>
      </div>
      <div className="w-[530px] relative rounded-[5px] border border-purple-500 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export interface VentureContentCardProps {
  children: React.ReactNode;
  className?: string;
}

export const VentureContentCard = ({
  children,
  className = '',
}: VentureContentCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};
