"use client";

import { SessionProvider } from "next-auth/react";

interface AuthProviderPros {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderPros) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
