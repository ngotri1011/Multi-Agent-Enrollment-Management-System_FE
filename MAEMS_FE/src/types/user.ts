
export type User = {
  userId: number;
  username: string
  email: string
  roleId: number
  roleName: string
  createdAt: string
  isActive: boolean
}

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export type UpdateUserRequest = {
  isActive: boolean;
  roleId: number;
}