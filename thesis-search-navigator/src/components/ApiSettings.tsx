
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Settings } from 'lucide-react';

interface ApiSettingsProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ apiUrl, onApiUrlChange }) => {
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onApiUrlChange(tempApiUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all rounded-md"
        >
          <Settings className="h-4 w-4 mr-2" />
          API Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure the connection to your thesis parser backend API.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              value={tempApiUrl}
              onChange={(e) => setTempApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            className="backdrop-blur-md bg-slate-800/90 hover:bg-slate-900/90 text-white"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettings;
