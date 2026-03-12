import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface GraphData {
  nodes: { id: string; label: string; type: string }[];
  links: { source: string; target: string; value: number }[];
}

export const graphService = {
  getGraphData: async (workspaceId: string, token: string): Promise<GraphData> => {
    const res = await axios.get(`${API_URL}/graph/${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
