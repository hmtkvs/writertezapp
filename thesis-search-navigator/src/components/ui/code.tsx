
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
}

export const Code = ({ children, className, ...props }: CodeProps) => {
  return (
    <pre
      className={cn(
        "bg-slate-800 text-slate-50 p-4 rounded-md overflow-x-auto text-sm",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  );
};
