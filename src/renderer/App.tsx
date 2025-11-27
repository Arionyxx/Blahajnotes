import React from 'react';
import { RichTextEditor } from './src/components/Editor/RichTextEditor';

const App = () => {
  return (
    <div className="container">
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h1>Notes App</h1>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
         <RichTextEditor />
      </div>
    </div>
  );
};

export default App;
