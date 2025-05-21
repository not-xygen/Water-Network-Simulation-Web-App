import "./index.css";
import SignInPage from "@/page/sign-in.tsx";
import SignUpPage from "@/page/sign-up.tsx";
import SimulationPage from "@/page/simulation.tsx";
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
]);

// biome-ignore lint/style/noNonNullAssertion: <intended>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
			<RouterProvider router={router} />
		</ClerkProvider>
	</StrictMode>,
);

scan({
	enabled: true,
});
