import React, { useState } from 'react';
import { RichTextEditor } from './src/components/Editor/RichTextEditor';
import { GraphCanvas } from './src/components/Graph/GraphCanvas';

const App = () => {
  const [view, setView] = useState<'notes' | 'graph'>('graph'); // Default to graph for testing

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>Story World</h1>
        <div>
            <button 
                onClick={() => setView('notes')}
                style={{ 
                    padding: '5px 10px', 
                    marginRight: '10px',
                    fontWeight: view === 'notes' ? 'bold' : 'normal',
                    background: view === 'notes' ? '#ddd' : '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Notes
            </button>
            <button 
                onClick={() => setView('graph')}
                style={{ 
                    padding: '5px 10px',
                    fontWeight: view === 'graph' ? 'bold' : 'normal',
                    background: view === 'graph' ? '#ddd' : '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Graph
            </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
         {view === 'notes' ? <RichTextEditor /> : <GraphCanvas />}
      </div>
    </div>
  );
};

export default App;
