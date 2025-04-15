
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import HighlightedTextPreview from './HighlightedTextPreview';
import RewriteInstructionsInput from './RewriteInstructionsInput';
import RewrittenTextArea from './RewrittenTextArea';

interface RewriteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  beforeText: string;
  afterText: string;
  rewrittenText: string;
  onConfirm: () => void;
  isProcessing: boolean;
  onUserCommandChange: (command: string) => void;
  userCommand: string;
}

const RewriteConfirmDialog: React.FC<RewriteConfirmDialogProps> = ({
  open,
  onOpenChange,
  originalText,
  beforeText,
  afterText,
  rewrittenText,
  onConfirm,
  isProcessing,
  onUserCommandChange,
  userCommand
}) => {
  const [editedRewrittenText, setEditedRewrittenText] = useState(rewrittenText);

  // Update editedRewrittenText when rewrittenText prop changes
  useEffect(() => {
    setEditedRewrittenText(rewrittenText);
  }, [rewrittenText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Text Rewrite Assistant</DialogTitle>
          <DialogDescription>
            Review the highlighted text in context and provide instructions for rewriting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <HighlightedTextPreview 
            beforeText={beforeText}
            originalText={originalText}
            afterText={afterText}
          />
          
          <RewriteInstructionsInput
            userCommand={userCommand}
            onUserCommandChange={onUserCommandChange}
          />
          
          <RewrittenTextArea
            rewrittenText={editedRewrittenText}
            isProcessing={isProcessing}
            onChange={setEditedRewrittenText}
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isProcessing}
          >
            <Check className="mr-2 h-4 w-4" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RewriteConfirmDialog;
