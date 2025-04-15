
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { rewriteText } from '@/lib/api';

interface TextSelectionData {
  selectedText: string;
  beforeText: string;
  afterText: string;
}

export function useTextRewrite(apiUrl: string) {
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userCommand, setUserCommand] = useState<string>('');
  const { toast } = useToast();

  const handleRewriteRequest = async (selectionData: TextSelectionData | null) => {
    if (!selectionData) return;
    
    try {
      setIsProcessing(true);
      
      try {
        // Use the rewriteText function from our API module
        const result = await rewriteText(
          selectionData.selectedText,
          selectionData.beforeText,
          selectionData.afterText,
          userCommand,
          apiUrl
        );
        
        setRewrittenText(result);
        
      } catch (error) {
        console.error('API request failed:', error);
        
        toast({
          title: "Using Mock Rewriter",
          description: "Could not connect to API, using local rewriter instead",
          variant: "default"
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, simply transform the text based on user command
        let mockRewrittenText = selectionData.selectedText;
        
        if (userCommand.toLowerCase().includes('formal')) {
          mockRewrittenText = `[Formal version] ${selectionData.selectedText}`;
        } else if (userCommand.toLowerCase().includes('simple')) {
          mockRewrittenText = `[Simplified] ${selectionData.selectedText}`;
        } else if (userCommand.toLowerCase().includes('french')) {
          mockRewrittenText = `[French Translation] ${selectionData.selectedText}`;
        } else {
          mockRewrittenText = `[Rewritten per instructions: "${userCommand}"] ${selectionData.selectedText}`;
        }
        
        setRewrittenText(mockRewrittenText);
      }
      
    } catch (error) {
      console.error('Error rewriting text:', error);
      
      toast({
        title: "Rewrite Failed",
        description: "Could not connect to the rewrite service",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserCommandChange = (command: string, selectionData: TextSelectionData | null) => {
    setUserCommand(command);
    if (command.trim() !== '') {
      handleRewriteRequest(selectionData);
    }
  };

  const handleConfirmRewrite = () => {
    // In a real implementation, we would apply the changes to the DOM
    // Here we'll just show a success toast
    toast({
      title: "Text Rewritten",
      description: "The selected text has been rewritten successfully"
    });
    return true;
  };

  return {
    rewrittenText,
    setRewrittenText,
    isProcessing,
    userCommand,
    setUserCommand,
    handleRewriteRequest,
    handleUserCommandChange,
    handleConfirmRewrite
  };
}
