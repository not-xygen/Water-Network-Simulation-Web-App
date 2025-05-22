import type React from "react";

import { AccessibilityPreferences } from "@/components/preferences/accessibility";
import { AccountPreferences } from "@/components/preferences/account";
import { AdvancedPreferences } from "@/components/preferences/advanced";
import { AppearancePreferences } from "@/components/preferences/appearance";
import { GeneralPreferences } from "@/components/preferences/general";
import { PrivacyPreferences } from "@/components/preferences/privacy";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  Globe,
  Palette,
  Settings,
  Shield,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

type PreferenceSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
};

export function DialogPreferences({
  open,
  onOpenChange,
  initialSection,
}: {
  open?: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange?: (open: boolean) => void;
  initialSection?: string;
}) {
  const [activeSection, setActiveSection] = useState<string>(
    initialSection || "general",
  );

  useEffect(() => {
    if (open && initialSection) {
      setActiveSection(initialSection);
    }
  }, [open, initialSection]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl p-0 h-[80vh] sm:rounded-e-none"
        onCloseAutoFocus={(e) => e.preventDefault()}
        aria-describedby="preferences-description">
        <div className="sr-only" id="preferences-description">
          Application settings to change user preferences
        </div>
        <div className="flex h-full overflow-hidden">
          <SidebarProvider defaultOpen={true} className="w-64">
            <Sidebar className="w-full border-r" collapsible="none">
              <SidebarContent>
                <div className="p-4 border-b">
                  <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Settings className="w-5 h-5" />
                    Preferences
                  </DialogTitle>
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
                        )}>
                        <section.icon className="w-5 h-5" />
                        <span>{section.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>

          <div className="flex-1 h-full overflow-y-auto">
            <div className="w-full p-6 pt-12 pb-16">{activeComponent}</div>
            <div className="sticky bottom-0 flex justify-end gap-2 p-4 border-t bg-background">
              <Button onClick={() => onOpenChange?.(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
