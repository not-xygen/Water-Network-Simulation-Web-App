import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      console.log("SSO Callback started");
      try {
        console.log("Current URL:", window.location.href);
        const customNavigate = async (to: string) => {
          console.log("Navigating to:", to);
          await navigate(to, { replace: true });
          setTimeout(() => {
            console.log("Reloading page...");
            window.location.reload();
          }, 100);
        };

        console.log("Handling redirect callback...");
        await handleRedirectCallback(
          {
            redirectUrl: window.location.href,
            afterSignInUrl: "/",
            afterSignUpUrl: "/sign-in",
          },
          customNavigate,
        );
        console.log("Redirect callback handled successfully");

        if (user) {
          console.log("User found, navigating to home");
          await navigate("/", { replace: true });
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          console.log("No user found, navigating to sign-in");
          navigate("/sign-in");
        }
      } catch (error) {
        console.error("SSO Callback error:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        navigate("/sign-in");
      }
    }

    handleCallback();
  }, [handleRedirectCallback, navigate, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Processing authentication...</h1>
        <p className="mt-2 text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
}
