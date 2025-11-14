import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

const RootLayout = () => (
  <>
    <HeadContent />
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

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    scripts: import.meta.env.DEV
      ? [
          {
            src: "//unpkg.com/react-scan/dist/auto.global.js",
          },
        ]
      : [],
  }),
});
