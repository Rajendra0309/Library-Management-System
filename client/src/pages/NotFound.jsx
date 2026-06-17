import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-page-padding text-center min-h-[60vh]">
      <span className="material-symbols-outlined text-[80px] text-text-tertiary mb-md">error</span>
      <h1 className="font-display-4xl text-display-4xl text-on-surface mb-sm">404</h1>
      <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-md">Page Not Found</h2>
      <p className="font-body-base text-body-base text-text-secondary max-w-md mb-xl">
        We couldn't find the page you were looking for. It may have been moved, deleted, or you may have mistyped the address.
      </p>
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-sm bg-primary text-white px-xl py-sm rounded-lg font-body-base text-body-base font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] transition-all active:scale-[0.97]"
      >
        <span className="material-symbols-outlined text-[20px]">home</span>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
