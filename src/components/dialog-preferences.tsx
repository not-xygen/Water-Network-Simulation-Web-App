import type React from "react";

import { AccessibilityPreferences } from "@/components/preferences/accessibility";
import { AccountPreferences } from "@/components/preferences/account";
import { AdvancedPreferences } from "@/components/preferences/advanced";
import { AppearancePreferences } from "@/components/preferences/appearance";
import { GeneralPreferences } from "@/components/preferences/general";
import { PrivacyPreferences } from "@/components/preferences/privacy";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
	Sidebar,
	SidebarContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
	Accessibility,
	Cog,
	Globe,
	Palette,
	Settings,
	Shield,
	User,
	Wrench,
} from "lucide-react";
import { useState } from "react";

type PreferenceSection = {
	id: string;
	label: string;
	icon: React.ElementType;
	component: React.ReactNode;
};

export function DialogPreferences({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [activeSection, setActiveSection] = useState<string>("general");

	const sections: PreferenceSection[] = [
		{
			id: "general",
			label: "General",
			icon: Globe,
			component: <GeneralPreferences />,
		},
		{
			id: "appearance",
			label: "Appearance",
			icon: Palette,
			component: <AppearancePreferences />,
		},
		{
			id: "privacy",
			label: "Privacy",
			icon: Shield,
			component: <PrivacyPreferences />,
		},
		{
			id: "account",
			label: "Account",
			icon: User,
			component: <AccountPreferences />,
		},
		{
			id: "accessibility",
			label: "Accessibility",
			icon: Accessibility,
			component: <AccessibilityPreferences />,
		},
		{
			id: "advanced",
			label: "Advanced",
			icon: Wrench,
			component: <AdvancedPreferences />,
		},
	];

	const activeComponent = sections.find(
		(section) => section.id === activeSection,
	)?.component;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="ghost" className="flex gap-2 text-xs">
						<Cog className="w-4 h-4" /> Preferences
					</Button>
				)}
			</DialogTrigger>
			<DialogContent
				className="max-w-4xl p-0 h-[80vh]"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<div className="flex h-full">
					<SidebarProvider defaultOpen={true}>
						<Sidebar className="w-64 border-r" collapsible="none">
							<SidebarContent>
								<div className="p-4 border-b">
									<h2 className="flex items-center gap-2 text-xl font-semibold">
										<Settings className="w-5 h-5" />
										Preferences
									</h2>
								</div>
								<SidebarMenu className="p-2">
									{sections.map((section) => (
										<SidebarMenuItem key={section.id}>
											<SidebarMenuButton
												isActive={activeSection === section.id}
												onClick={() => setActiveSection(section.id)}
												className={cn(
													"flex items-center gap-3 w-full",
													activeSection === section.id && "font-medium",
												)}
											>
												<section.icon className="w-5 h-5" />
												<span>{section.label}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarContent>
						</Sidebar>
					</SidebarProvider>

					<div className="flex-1 overflow-y-auto">
						<div className="w-full p-6">{activeComponent}</div>
						<div className="sticky bottom-0 flex justify-end gap-2 p-4 border-t bg-background">
							<Button>Save Changes</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
