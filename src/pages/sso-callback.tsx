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
				const customNavigate = async (to: string) => {
					await navigate(to, { replace: true });
					setTimeout(() => {
						window.location.reload();
					}, 100);
				};

				await handleRedirectCallback(
					{
						redirectUrl: window.location.href,
						afterSignInUrl: "/",
						afterSignUpUrl: "/sign-in",
					},
					customNavigate,
				);

				if (user) {
					await navigate("/", { replace: true });
					setTimeout(() => {
						window.location.reload();
					}, 100);
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
