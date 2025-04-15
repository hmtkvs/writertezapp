
import React from 'react';
import { Input } from '@/components/ui/input';
import { Command } from 'lucide-react';

interface RewriteInstructionsInputProps {
  userCommand: string;
  onUserCommandChange: (command: string) => void;
}

const RewriteInstructionsInput: React.FC<RewriteInstructionsInputProps> = ({
  userCommand,
  onUserCommandChange
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium flex items-center">
        <Command className="mr-2 h-4 w-4" />
        Rewrite Instructions:
      </label>
      <Input
        value={userCommand}
        onChange={(e) => onUserCommandChange(e.target.value)}
        placeholder="E.g., Make this more formal, Simplify this text, Translate to French..."
        className="w-full"
      />
    </div>
  );
};

export default RewriteInstructionsInput;
