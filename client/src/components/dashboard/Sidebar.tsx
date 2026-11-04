"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import {
  getNavGroupsForRole,
  getAllHrefsForRole,
  NavGroup,
} from "@/config/navigation.config";
import { ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface PortalSidebarProps {
  onCloseMobile?: () => void;
}

export function SidebarComponent({ onCloseMobile }: PortalSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navGroups: NavGroup[] = getNavGroupsForRole(user?.role);
  const allHrefs = getAllHrefsForRole(user?.role);
  const homeHref = user?.role
    ? ROLE_DASHBOARD_ROUTES[user.role]
    : "/auth/login";

  const getPortalSubtitle = () => {
    switch (user?.role) {
      case "STUDENT":
        return "Student Portal";
      case "LECTURER":
        return "Lecturer Workspace";
      case "DEPARTMENT_ADMIN":
        return "Department Portal";
      case "SUPER_ADMIN":
        return "University Admin";
      default:
        return "Academic Portal";
    }
  };

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (["/admin", "/student", "/lecturer", "/dept-admin"].includes(href)) {
      return false;
    }

    if (pathname.startsWith(href + "/")) {
      const hasMoreSpecificMatch = allHrefs.some(
        (otherHref) =>
          otherHref !== href &&
          otherHref.length > href.length &&
          (pathname === otherHref || pathname.startsWith(otherHref + "/")),
      );
      return !hasMoreSpecificMatch;
    }
    return false;
  };

  return (
    <Sidebar
        variant="floating"
        collapsible="offcanvas"
        className="border-none bg-transparent font-sans"
      >
        {/* Brand Header */}
        <SidebarHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href={homeHref}
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-burgundy-700 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-burgundy-800 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 block leading-none">
                UEMP
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-1 truncate">
                Lead Web Praxis University
              </span>
            </div>
          </Link>
        </SidebarHeader>

        {/* Navigation Groups */}
        <SidebarContent className="px-2 py-2 space-y-2">
          {!mounted
            ? [
                { id: "s1", count: 1, labelWidth: "w-16" },
                { id: "s2", count: 3, labelWidth: "w-24" },
                { id: "s3", count: 2, labelWidth: "w-28" },
              ].map((section) => (
                <SidebarGroup key={section.id} className="p-0">
                  <div className="px-2.5 h-7 flex items-center">
                    <Skeleton
                      className={`h-2.5 ${section.labelWidth} rounded-sm`}
                    />
                  </div>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {Array.from({ length: section.count }).map((_, i) => (
                        <SidebarMenuItem key={i}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))
            : navGroups.map((group) => {
                if (group.items.length === 0) return null;

                return (
                  <SidebarGroup key={group.group} className="p-0">
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2.5 h-7">
                      {group.group}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                          const isActive = isItemActive(item.href);
                          const Icon = item.icon;

                          return (
                            <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.label}
                                className={cn(
                                  "text-xs transition-colors rounded-lg",
                                  isActive
                                    ? "bg-burgundy-50 text-burgundy-800 font-semibold border border-burgundy-200/80 shadow-2xs dark:bg-burgundy-950/60 dark:text-burgundy-200 dark:border-burgundy-800/80"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent",
                                )}
                              >
                                <Link
                                  href={item.href}
                                  onClick={closeMobileSidebar}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Icon
                                    className={`h-4 w-4 shrink-0 transition-colors ${
                                      isActive
                                        ? "text-burgundy-700 dark:text-burgundy-300"
                                        : "text-zinc-400 group-hover/menu-button:text-zinc-600 dark:text-zinc-500 dark:group-hover/menu-button:text-zinc-300"
                                    }`}
                                  />
                                  <span className="truncate flex-1">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
        </SidebarContent>
      </Sidebar>
    );
  }

export { SidebarComponent as Sidebar, SidebarComponent as AdminSidebar };
