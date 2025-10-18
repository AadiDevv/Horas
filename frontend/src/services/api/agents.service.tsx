// import { API_CONFIG } from '@/constants/config';
// import { Agent, CreateAgentDTO, UpdateAgentDTO } from '@/types';
// import { mockAgents } from '@/app/services/api/mock/mockAgents';

// type ApiResponse<T> = {
//   success: boolean;
//   data?: T;
//   message?: string;
// };

// export const agentsService = {
//   async getAll(): Promise<ApiResponse<Agent[]>> {
//     if (API_CONFIG.USE_MOCK) {
//       await new Promise(resolve => setTimeout(resolve, 300));
//       return { success: true, data: mockAgents };
//     }
    
//     const res = await fetch(`${API_CONFIG.BASE_URL}/api/users`);
//     return res.json();
//   },

//   async create(agent: CreateAgentDTO): Promise<ApiResponse<Agent>> {
//     if (API_CONFIG.USE_MOCK) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       const newAgent = {
//         id: mockAgents.length + 1,
//         ...agent,
//         isActive: true,
//         createdAt: new Date().toISOString()
//       } as Agent;
//       mockAgents.push(newAgent);
//       console.log('✅ Agent créé:', newAgent);
//       return { success: true, data: newAgent };
//     }
    
//     const res = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(agent)
//     });
//     return res.json();
//   },

//   async update(id: number, updates: UpdateAgentDTO): Promise<ApiResponse<Agent>> {
//     if (API_CONFIG.USE_MOCK) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       const index = mockAgents.findIndex(a => a.id === id);
//       if (index === -1) {
//         return { success: false, message: 'Agent non trouvé' };
//       }
//       mockAgents[index] = { ...mockAgents[index], ...updates };
//       return { success: true, data: mockAgents[index] };
//     }
    
//     const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updates)
//     });
//     return res.json();
//   },

//   async delete(id: number): Promise<ApiResponse<void>> {
//     if (API_CONFIG.USE_MOCK) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       const index = mockAgents.findIndex(a => a.id === id);
//       if (index === -1) {
//         return { success: false, message: 'Agent non trouvé' };
//       }
//       mockAgents.splice(index, 1);
//       return { success: true };
//     }
    
//     const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
//       method: 'DELETE'
//     });
//     return res.json();
//   }
// };