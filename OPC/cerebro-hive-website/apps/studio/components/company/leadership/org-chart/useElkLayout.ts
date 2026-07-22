import { useState, useCallback } from 'react';
import { Node, Edge, Position } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.direction': 'DOWN',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  'elk.alignment': 'CENTER'
};

export const useElkLayout = () => {
  const [isLayouting, setIsLayouting] = useState(false);

  const getLayoutedElements = useCallback(async (nodes: Node[], edges: Edge[]) => {
    setIsLayouting(true);

    const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: nodes.map(node => ({
        id: node.id,
        // Approximate dimensions based on node type
        width: node.type === 'executive' ? 320 : node.type === 'team' ? 180 : 240,
        height: node.type === 'executive' ? 240 : node.type === 'team' ? 100 : 220
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target]
      }))
    };

    try {
      const layoutedGraph = await elk.layout(graph);
      
      const layoutedNodes = nodes.map(node => {
        const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
        if (!elkNode) return node;

        return {
          ...node,
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          position: {
            x: elkNode.x || 0,
            y: elkNode.y || 0
          }
        };
      });

      setIsLayouting(false);
      return { nodes: layoutedNodes, edges };
    } catch (error) {
      console.error('ELK Layout Error:', error);
      setIsLayouting(false);
      return { nodes, edges };
    }
  }, []);

  return { getLayoutedElements, isLayouting };
};
