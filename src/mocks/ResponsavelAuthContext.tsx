import React from "react";
export * from "@/contexts/ResponsavelAuthContext.tsx?original";
export { useResponsavelAuthMock as useResponsavelAuth } from "@mocks/responsavel";
export const ResponsavelAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
