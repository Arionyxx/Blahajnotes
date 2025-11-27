import React, { useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { useEditor } from '../../hooks/useEditor';
import { Toolbar } from './Toolbar';
import { Preview } from './Preview';

export const RichTextEditor: React.FC = () => {
  const editor = useEditor();
  const [showPreview, setShowPreview] = useState(false);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc' }}>
        <Toolbar editor={editor} />
        <button onClick={() => setShowPreview(!showPreview)} style={{ margin: '10px' }}>
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>
      
      <div className="editor-workspace" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="editor-container" style={{ flex: 1, overflowY: 'auto', padding: '20px', borderRight: showPreview ? '1px solid #ccc' : 'none' }}>
           <EditorContent editor={editor} />
        </div>
        
        {showPreview && (
          <div className="preview-container" style={{ flex: 1, overflowY: 'auto', borderLeft: '1px solid #ccc' }}>
            <Preview content={editor.getHTML()} />
          </div>
        )}
      </div>
    </div>
  );
};
