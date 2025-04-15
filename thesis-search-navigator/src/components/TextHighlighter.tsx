
import React, { useState } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { useTextRewrite } from '@/hooks/use-text-rewrite';
import TextContextMenu from '@/components/TextContextMenu';
import RewriteConfirmDialog from './RewriteConfirmDialog';

interface TextHighlighterProps {
  children: React.ReactNode;
  apiUrl: string;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({ children, apiUrl }) => {
  const [showDialog, setShowDialog] = useState(false);
  const { selectionData, setSelectionData, handleContextMenuOpen } = useTextSelection();
  const {
    rewrittenText,
    setRewrittenText,
    isProcessing,
    userCommand,
    setUserCommand,
    handleRewriteRequest,
    handleUserCommandChange,
    handleConfirmRewrite
  } = useTextRewrite(apiUrl);

  const handleOpenDialog = (event: React.MouseEvent) => {
    // Prevent the default browser context menu
    event.preventDefault(); 
    // Prevent propagation to stop any parent handlers
    event.stopPropagation();
    
    setUserCommand('');
    setRewrittenText('');
    setShowDialog(true);
  };

  const handleConfirmDialog = () => {
    if (handleConfirmRewrite()) {
      setShowDialog(false);
    }
  };

  const handleCommandChange = (command: string) => {
    handleUserCommandChange(command, selectionData);
  };

  return (
    <>
      <TextContextMenu
        onOpenChange={handleContextMenuOpen}
        onRewriteClick={handleOpenDialog}
        isProcessing={isProcessing}
      >
        {children}
      </TextContextMenu>
      
      <RewriteConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        originalText={selectionData?.selectedText || ''}
        beforeText={selectionData?.beforeText || ''}
        afterText={selectionData?.afterText || ''}
        rewrittenText={rewrittenText}
        onConfirm={handleConfirmDialog}
        isProcessing={isProcessing}
        onUserCommandChange={handleCommandChange}
        userCommand={userCommand}
      />
    </>
  );
};

export default TextHighlighter;
