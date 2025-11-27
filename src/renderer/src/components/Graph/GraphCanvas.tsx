import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { useGraphStore } from '../../store/graphStore';
import { useGraph } from '../../hooks/useGraph';
import { nodeTypes } from './NodeTypes';
import { ContextMenu } from './ContextMenu';

const GraphCanvasContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    addNode, deleteNode, undo, redo, updateNodeData 
  } = useGraphStore();
  
  const { handleNodeDragStop, isLoaded } = useGraph();
  const { project } = useReactFlow();

  const [menu, setMenu] = useState<{ top: number; left: number; nodeId?: string; position?: {x:number, y:number} } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (pane) {
          setMenu({
            top: event.clientY - pane.top,
            left: event.clientX - pane.left,
            position: project({ x: event.clientX - pane.left, y: event.clientY - pane.top })
          });
      }
    },
    [project]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
       const pane = reactFlowWrapper.current?.getBoundingClientRect();
       if (pane) {
          setMenu({
            top: event.clientY - pane.top,
            left: event.clientX - pane.left,
            nodeId: node.id
          });
       }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNodeId(null);
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
  }, []);

  const handleAddNode = useCallback((type: string) => {
    if (menu?.position) {
        const id = uuidv4();
        addNode({
            id,
            type,
            position: menu.position,
            data: { label: `New ${type}` }
        });
    }
    setMenu(null);
  }, [menu, addNode]);
  
  const handleDeleteNode = useCallback(() => {
      if (menu?.nodeId) {
          deleteNode(menu.nodeId);
      }
      setMenu(null);
  }, [menu, deleteNode]);

  // Keyboard shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
             if (e.shiftKey) {
                 redo();
             } else {
                 undo();
             }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!isLoaded) {
      return <div style={{ padding: '20px' }}>Loading graph...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          onNodeDragStop={handleNodeDragStop}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
          {menu && (
              <ContextMenu 
                  top={menu.top} 
                  left={menu.left} 
                  onClose={() => setMenu(null)}
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  nodeId={menu.nodeId}
              />
          )}
        </ReactFlow>
      </div>
      
      {/* Sidebar for editing */}
      {selectedNode && (
          <div style={{ width: '250px', borderLeft: '1px solid #ddd', padding: '15px', background: '#f9f9f9', overflowY: 'auto' }}>
              <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '1.1em' }}>Edit Node</div>
              <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>Label</label>
                  <input 
                    type="text" 
                    value={selectedNode.data.label || ''} 
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    style={{ width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
              </div>
              <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>Type</label>
                  <div style={{ padding: '5px 10px', background: '#eee', borderRadius: '4px', display: 'inline-block' }}>{selectedNode.type}</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '15px 0' }} />
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Data</div>
              {Object.keys(selectedNode.data).map(key => {
                  if (key === 'label') return null;
                  return (
                      <div key={key} style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>{key}</label>
                          <textarea
                             value={selectedNode.data[key]}
                             onChange={(e) => updateNodeData(selectedNode.id, { [key]: e.target.value })}
                             style={{ width: '100%', padding: '5px', minHeight: '60px', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                      </div>
                  );
              })}
              <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={() => {
                      const key = prompt("New field name:");
                      if (key) updateNodeData(selectedNode.id, { [key]: '' });
                    }}
                    style={{ padding: '5px 10px', cursor: 'pointer', background: '#e0e0e0', border: 'none', borderRadius: '4px' }}
                  >
                    + Add Field
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export const GraphCanvas = () => (
  <ReactFlowProvider>
    <GraphCanvasContent />
  </ReactFlowProvider>
);
