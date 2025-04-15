
import { useState, useRef } from 'react';

interface TextSelectionData {
  selectedText: string;
  beforeText: string;
  afterText: string;
}

export function useTextSelection() {
  const [selectionData, setSelectionData] = useState<TextSelectionData | null>(null);
  // Use ref to store current selection data to avoid losing it during state changes
  const selectionRef = useRef<Selection | null>(null);

  // Check for text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    selectionRef.current = selection;
    
    if (!selection || selection.toString().trim() === '') return null;
    
    // Get selected text
    const selectedText = selection.toString();
    
    try {
      // Get the chapter text
      // First, find the container with the selected text
      const range = selection.getRangeAt(0);
      
      // Find the closest .search-result or chapter container
      let container: Element | null = range.commonAncestorContainer as Element;
      
      // If the node is a text node, get its parent element
      if (container.nodeType !== Node.ELEMENT_NODE) {
        container = container.parentElement;
      }
      
      while (container) {
        // Look for a chapter or section container
        if (
          container.classList?.contains('search-result') || 
          (container as HTMLElement).dataset?.chapter
        ) {
          break;
        }
        const parent = container.parentElement;
        if (!parent) break;
        container = parent;
      }
      
      // If we found a container, extract all its text
      if (container && container.textContent) {
        const fullText = container.textContent;
        
        // Find the position of the selected text in the full text
        const selectionStart = fullText.indexOf(selectedText);
        if (selectionStart !== -1) {
          const beforeText = fullText.substring(0, selectionStart);
          const afterText = fullText.substring(selectionStart + selectedText.length);
          
          return {
            selectedText,
            beforeText,
            afterText
          };
        }
      }
    } catch (error) {
      console.error('Error getting chapter text:', error);
    }
    
    // Fallback if we can't get the chapter text
    return {
      selectedText,
      beforeText: '',
      afterText: ''
    };
  };

  const handleContextMenuOpen = (open: boolean) => {
    if (open) {
      const data = handleTextSelection();
      if (data) {
        setSelectionData(data);
        console.log('Selection data:', data);
        return true;
      }
      return false;
    }
    return true;
  };

  return {
    selectionData,
    setSelectionData,
    handleContextMenuOpen,
  };
}
