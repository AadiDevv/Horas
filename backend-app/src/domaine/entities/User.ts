export interface UserEntity {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserEntity {
  email: string;
  name?: string;
}

export interface UpdateUserEntity {
  email?: string;
  name?: string;
}
