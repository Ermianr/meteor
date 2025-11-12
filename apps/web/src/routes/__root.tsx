import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

const RootLayout = () => (
  <>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      enableSystem={false}
    >
      <Outlet />
      <Toaster />
    </ThemeProvider>
    <TanStackRouterDevtools />
    <ReactQueryDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
