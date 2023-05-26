import { createContext } from "react";

export type AuthUser = {
  fullName: string;
  email: string;
  password: string;
  isBilling?: boolean;
};

export const AuthUserContext = createContext<any>(null);
