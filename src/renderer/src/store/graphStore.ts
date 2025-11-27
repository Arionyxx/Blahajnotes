import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { GraphData } from '../../../shared/types';

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setGraph: (data: GraphData) => void;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  
  // History
  history: GraphData[];
  historyIndex: number;
  isLoaded: boolean;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setIsLoaded: (loaded: boolean) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,
  isLoaded: false,

  setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),

  onNodesChange: (changes: NodeChange[]) => {
    const { nodes, edges } = get();
    const newNodes = applyNodeChanges(changes, nodes);
    
    // Handle edge cleanup for removed nodes
    const removedIds = new Set(changes.filter(c => c.type === 'remove').map(c => c.id));
    let newEdges = edges;
    
    if (removedIds.size > 0) {
      newEdges = edges.filter(e => !removedIds.has(e.source) && !removedIds.has(e.target));
    }

    set({ nodes: newNodes, edges: newEdges });
    
    // Push history only for significant changes (remove, add, drag end handled elsewhere)
    // React Flow triggers 'remove' change when pressing Backspace.
    if (removedIds.size > 0) {
       get().pushHistory();
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const { edges } = get();
    const newEdges = applyEdgeChanges(changes, edges);
    set({ edges: newEdges });
    
    if (changes.some(c => c.type === 'remove')) {
      get().pushHistory();
    }
  },

  onConnect: (connection: Connection) => {
    const { edges } = get();
    set({ edges: addEdge(connection, edges) });
    get().pushHistory();
  },

  setGraph: (data: GraphData) => {
    set({ 
      nodes: data.nodes, 
      edges: data.edges,
      history: [data],
      historyIndex: 0
    });
  },

  addNode: (node: Node) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node] });
    get().pushHistory();
  },
  
  updateNodeData: (id: string, data: any) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((node) => {
        if (node.id === id) {
          // Merge data
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
    // We might not want to push history on every keystroke, but for now let's keep it simple.
    // Or maybe updateNodeData is called on blur or debounced.
  },

  deleteNode: (id: string) => {
    const { nodes, edges } = get();
    const newNodes = nodes.filter((n) => n.id !== id);
    const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
    set({ nodes: newNodes, edges: newEdges });
    get().pushHistory();
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const currentGraph = { nodes, edges };
    
    // If we are not at the end of history, discard future
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentGraph);
    
    // Limit history size if needed (e.g. 50)
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevGraph = history.slice(prevIndex, prevIndex + 1)[0]; // history[prevIndex] but safe
      if (prevGraph) {
        set({
          nodes: prevGraph.nodes,
          edges: prevGraph.edges,
          historyIndex: prevIndex,
        });
      }
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextGraph = history[nextIndex];
      set({
        nodes: nextGraph.nodes,
        edges: nextGraph.edges,
        historyIndex: nextIndex,
      });
    }
  },
}));
