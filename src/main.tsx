import "./index.css";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import SimulationPage from "@/pages/simulation";
import SSOCallback from "@/pages/sso-callback";
import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { scan } from "react-scan";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <SimulationPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/sso-callback",
    element: <SSOCallback />,
  },
]);

// biome-ignore lint/style/noNonNullAssertion: <intended>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);

scan({
  enabled: true,
});
