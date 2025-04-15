
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';
import ApiSettings from './ApiSettings';

interface HeaderProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
}

const Header: React.FC<HeaderProps> = ({ apiUrl, onApiUrlChange }) => {
  return (
    <header className="bg-[#2C3E50] text-white p-4 md:p-6 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">TeX Thesis Navigator</h1>
            <p className="text-slate-300 text-sm md:text-base">Search and explore your thesis content</p>
          </div>
          <div className="flex gap-3">
            <Link to="/concept-dashboard">
              <Button 
                variant="outline" 
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all rounded-md"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Concept Dashboard
              </Button>
            </Link>
            <ApiSettings apiUrl={apiUrl} onApiUrlChange={onApiUrlChange} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
