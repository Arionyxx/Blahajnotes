import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const NodeBase = ({ data, type, isConnectable, selected }: NodeProps) => {
  let bgColor = '#fff';
  let borderColor = '#777';
  
  switch (type) {
    case 'character': 
        bgColor = '#ffebee'; // Red 50
        borderColor = '#ef5350'; // Red 400
        break;
    case 'location': 
        bgColor = '#e8f5e9'; // Green 50
        borderColor = '#66bb6a'; // Green 400
        break;
    case 'event': 
        bgColor = '#e3f2fd'; // Blue 50
        borderColor = '#42a5f5'; // Blue 400
        break;
    case 'plot_point': 
        bgColor = '#fff8e1'; // Amber 50
        borderColor = '#ffca28'; // Amber 400
        break;
    case 'theme': 
        bgColor = '#f3e5f5'; // Purple 50
        borderColor = '#ab47bc'; // Purple 400
        break;
    default: 
        bgColor = '#fff';
        borderColor = '#777';
  }

  if (selected) {
    borderColor = '#2196f3'; // Blue 500
  }

  return (
    <div style={{ 
      padding: '10px', 
      border: `2px solid ${borderColor}`, 
      borderRadius: '8px', 
      backgroundColor: bgColor,
      minWidth: '120px',
      textAlign: 'center',
      boxShadow: selected ? '0 0 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease'
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#555' }} />
      <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{data.label}</div>
      <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{type}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#555' }} />
    </div>
  );
};

const MemoNode = memo(NodeBase);

export const nodeTypes = {
  character: MemoNode,
  location: MemoNode,
  event: MemoNode,
  plot_point: MemoNode,
  theme: MemoNode,
};
