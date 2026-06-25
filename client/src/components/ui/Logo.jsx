import React from 'react';

const Logo = ({ className = "h-8 w-8", withText = false, textClassName = "text-xl font-bold tracking-tight" }) => {
  return (
    <div className={`flex items-center gap-2 ${withText ? '' : 'justify-center'}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" className="text-primary" />
        <path d="M8 7h6" className="text-primary/60" />
        <path d="M8 11h8" className="text-primary/60" />
        <circle cx="17" cy="16" r="3" fill="currentColor" stroke="none" className="text-blue-500" />
      </svg>
      {withText && (
        <span className={textClassName}>
          LibraVault
        </span>
      )}
    </div>
  );
};

export default Logo;
