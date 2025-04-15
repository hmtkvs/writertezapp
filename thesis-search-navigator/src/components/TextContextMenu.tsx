
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Wand2 } from 'lucide-react';

interface TextContextMenuProps {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => boolean;
  onRewriteClick: (event: React.MouseEvent) => void;
  isProcessing: boolean;
}

const TextContextMenu: React.FC<TextContextMenuProps> = ({
  children,
  onOpenChange,
  onRewriteClick,
  isProcessing
}) => {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger className="contents">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent onPointerDownOutside={(e) => e.preventDefault()}>
        <ContextMenuItem 
          onClick={onRewriteClick}
          disabled={isProcessing}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Rewrite Selected Text
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TextContextMenu;
