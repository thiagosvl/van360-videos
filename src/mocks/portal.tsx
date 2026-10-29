// Mock de @radix-ui/react-portal: renderiza no lugar, sem portal.
// Assim diálogos e gavetas do app abrem DENTRO do celular do vídeo.
import React from "react";

export const Portal = React.forwardRef<HTMLDivElement, any>(({ asChild, container: _c, children, ...rest }, ref) => {
  if (asChild) return <>{children}</>;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
});
Portal.displayName = "Portal";
export const Root = Portal;
export default Portal;
