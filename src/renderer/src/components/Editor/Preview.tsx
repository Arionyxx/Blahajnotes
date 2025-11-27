import React, { useMemo } from 'react';
import TurndownService from 'turndown';

interface PreviewProps {
  content: string; // HTML content
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  const markdown = useMemo(() => {
    const turndownService = new TurndownService();
    return turndownService.turndown(content);
  }, [content]);

  return (
    <div className="preview-markdown" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', padding: '10px', backgroundColor: '#f5f5f5', height: '100%', overflowY: 'auto' }}>
      {markdown}
    </div>
  );
};
