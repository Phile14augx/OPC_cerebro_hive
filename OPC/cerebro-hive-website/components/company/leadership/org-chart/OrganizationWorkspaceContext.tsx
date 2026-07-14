"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OrganizationNodeData } from '@/lib/services/organizationService';

interface WorkspaceState {
  selectedNode: OrganizationNodeData | null;
  setSelectedNode: (node: OrganizationNodeData | null) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  expandedNodes: Set<string>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
}

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined);

export const OrganizationWorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNode, setSelectedNode] = useState<OrganizationNodeData | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <WorkspaceContext.Provider value={{
      selectedNode, setSelectedNode,
      hoveredNodeId, setHoveredNodeId,
      expandedNodes, setExpandedNodes,
      searchQuery, setSearchQuery,
      zoomLevel, setZoomLevel
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useOrganizationWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useOrganizationWorkspace must be used within an OrganizationWorkspaceProvider');
  }
  return context;
};
