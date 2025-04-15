
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-slate-500">
        <p>TeX Thesis Navigator | Connected to Research Papers API</p>
        <p className="mt-2 text-xs">© {new Date().getFullYear()} | Academic Research Tool</p>
      </div>
    </footer>
  );
};

export default Footer;
