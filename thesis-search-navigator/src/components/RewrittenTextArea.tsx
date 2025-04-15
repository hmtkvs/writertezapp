
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface RewrittenTextAreaProps {
  rewrittenText: string;
  isProcessing: boolean;
  onChange: (text: string) => void;
}

const RewrittenTextArea: React.FC<RewrittenTextAreaProps> = ({
  rewrittenText,
  isProcessing,
  onChange
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Rewritten Text (editable):</label>
      <Textarea
        value={rewrittenText}
        onChange={(e) => onChange(e.target.value)}
        className="h-[150px]"
        placeholder={isProcessing ? "Processing your request..." : "Rewritten text will appear here..."}
        disabled={isProcessing}
      />
    </div>
  );
};

export default RewrittenTextArea;
