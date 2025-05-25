import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      console.log("Starting OAuth callback handling...");
      console.log("Current URL:", window.location.href);
      console.log("User state:", { isLoaded: isUserLoaded, user });

      try {
        console.log("Calling handleRedirectCallback...");
        const result = await handleRedirectCallback({
          redirectUrl: window.location.href,
          afterSignInUrl: "/",
          afterSignUpUrl: "/",
        });

        console.log("OAuth callback result:", result);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (user) {
          console.log("User found, redirecting to home...");
          navigate("/", { replace: true });
        } else {
          console.error("No user found after callback");
          console.log("Redirecting to sign-in...");
          navigate("/sign-in");
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        console.log("Redirecting to sign-in due to error...");
        navigate("/sign-in");
      }
    }

    handleCallback();
  }, [handleRedirectCallback, navigate, isUserLoaded, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Memproses autentikasi...</h1>
        <p className="mt-2 text-gray-600">Mohon tunggu sebentar</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Status: {isUserLoaded ? "User loaded" : "Loading user..."}</p>
          {user && <p>User ID: {user.id}</p>}
        </div>
      </div>
    </div>
  );
}
