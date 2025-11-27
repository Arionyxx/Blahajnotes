import { useEffect, useRef, useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';
import { GraphData } from '../../../shared/types';

export const useGraph = () => {
  const { 
    nodes, 
    edges, 
    setGraph, 
    pushHistory,
    isLoaded,
    setIsLoaded
  } = useGraphStore();
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load graph on mount
    const load = async () => {
      try {
        const data = await window.fileSystem.loadGraph();
        // Ensure nodes have position if missing (migration)
        // And ensure label is in data for React Flow components
        const validNodes = data.nodes.map(n => ({
            ...n,
            position: n.position || { x: 0, y: 0 },
            data: { ...n.data, label: n.label || n.data?.label || 'Untitled' }
        }));
        setGraph({ ...data, nodes: validNodes });
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load graph:", error);
      }
    };
    load();
  }, [setGraph, setIsLoaded]);

  // Debounced save
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const graphData: GraphData = { 
        nodes: nodes.map(n => ({
          ...n,
          label: n.data.label
        })), 
        edges 
      };
      window.fileSystem.saveGraph(graphData).catch(err => {
        console.error("Failed to save graph:", err);
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, isLoaded]);
  
  const handleNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  return {
    handleNodeDragStop,
    isLoaded
  };
};
