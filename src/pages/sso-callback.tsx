import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback({
          redirectUrl: window.location.href,
          afterSignInUrl: "/",
          afterSignUpUrl: "/",
        });

        if (user) {
          navigate("/", { replace: true });
        } else {
          navigate("/sign-in");
        }
      } catch {
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
