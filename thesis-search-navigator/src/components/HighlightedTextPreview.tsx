
import React from 'react';

interface HighlightedTextPreviewProps {
  beforeText: string;
  originalText: string;
  afterText: string;
}

const HighlightedTextPreview: React.FC<HighlightedTextPreviewProps> = ({
  beforeText,
  originalText,
  afterText
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Text in Context:</label>
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 font-mono text-sm whitespace-pre-wrap">
        <span className="text-gray-800">{beforeText}</span>
        <span className="bg-amber-200 font-medium text-amber-900">{originalText}</span>
        <span className="text-gray-800">{afterText}</span>
      </div>
      <p className="text-xs text-slate-500">The highlighted portion will be rewritten based on your instructions.</p>
    </div>
  );
};

export default HighlightedTextPreview;
