import React from 'react';

export interface ContextMenuProps {
  top: number;
  left: number;
  onClose: () => void;
  onAddNode: (type: string) => void;
  onDeleteNode: () => void;
  nodeId?: string;
}

export const ContextMenu = ({ 
  top, left, onClose, onAddNode, onDeleteNode, nodeId 
}: ContextMenuProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        padding: '5px 0',
        minWidth: '150px',
      }}
    >
      {nodeId ? (
        <div 
            style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} 
            onClick={(e) => { e.stopPropagation(); onDeleteNode(); onClose(); }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Delete Node
        </div>
      ) : (
        <>
          <div style={{ padding: '4px 12px', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>ADD NODE</div>
          {['character', 'location', 'event', 'plot_point', 'theme'].map((type) => (
            <div
              key={type}
              style={{ padding: '8px 12px', cursor: 'pointer', textTransform: 'capitalize', fontSize: '14px' }}
              onClick={(e) => { e.stopPropagation(); onAddNode(type); onClose(); }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {type.replace('_', ' ')}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
