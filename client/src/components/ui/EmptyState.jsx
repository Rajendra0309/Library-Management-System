import React from 'react';
import { cn } from '../../lib/utils';
import { FolderX } from 'lucide-react';

export const EmptyState = ({ 
  title = "No results found", 
  description = "There are currently no items to display in this section.",
  icon: Icon = FolderX,
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-muted/20 animate-in fade-in duration-500", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};
