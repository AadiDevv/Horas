import { UserProps } from '../../../../backend-app/src/domain/types/entitiyProps';

export const mockAgents: UserProps[] = [
  {
    id: 1,
    prenom: "John",
    nom: "Ekeler",
    email: "john.ekeler@example.com",
    role: "employe",
    telephone: "+33 6 12 34 56 78",
    equipeId: 1,
    isActive: true,
    createdAt: new Date("2025-01-01T12:00:00.000Z"),
    hashedPassword: "mockedHashedPassword123"
  },
  // ... autres agents
];