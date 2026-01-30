"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/functions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BarChart3Icon,
  ClipboardListIcon,
  ShieldCheckIcon,
  FileTextIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  KeyIcon,
  PaletteIcon,
  BellRingIcon,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: BarChart3Icon,
    badge: null,
  },
  {
    title: 'Assessments',
    href: '/app/assessments',
    icon: ClipboardListIcon,
    badge: null,
  },
  {
    title: 'Compliance Status',
    href: '/app/compliance',
    icon: ShieldCheckIcon,
    badge: null,
  },
  {
    title: 'Documentation',
    href: '/app/documentation',
    icon: FileTextIcon,
    badge: null,
  },
  {
    title: 'Regulatory Alerts',
    href: '/app/alerts',
    icon: BellIcon,
    badge: 3,
  },
];

const settingsSubItems = [
  {
    title: 'Profile',
    href: '/app/settings/profile',
    icon: UserIcon,
  },
  {
    title: 'Security',
    href: '/app/settings/security',
    icon: KeyIcon,
  },
  {
    title: 'Appearance',
    href: '/app/settings/appearance',
    icon: PaletteIcon,
  },
  {
    title: 'Notifications',
    href: '/app/settings/notifications',
    icon: BellRingIcon,
  },
];

export function EnhancedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-zinc-800 bg-black transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Floating Collapse Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-50 h-8 w-6 rounded-l-none rounded-r-lg bg-zinc-900 border border-l-0 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-lg",
                collapsed ? "right-[-24px]" : "right-[-24px]"
              )}
            >
              {collapsed ? (
                <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
        {/* Logo/Brand Area */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && (
            <Link href="/app" className="flex items-center gap-3 group">
              <Image 
                src="/images/logo.png" 
                alt="Lexura Logo" 
                width={28} 
                height={28}
                quality={100}
                priority
                className="group-hover:scale-110 transition-transform object-contain"
              />
              <span className="text-lg font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Lexura
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/app" className="flex items-center justify-center w-full">
              <Image 
                src="/images/logo.png" 
                alt="Lexura Logo" 
                width={28} 
                height={28}
                quality={100}
                priority
                className="hover:scale-110 transition-transform object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1 py-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const navItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-zinc-900 hover:text-white",
                    isActive
                      ? "bg-gradient-to-r from-blue-600/10 to-blue-500/5 text-white border-l-2 border-blue-500"
                      : "text-zinc-400",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-500")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700 h-5 min-w-5 flex items-center justify-center px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="bg-blue-600 text-white h-5 min-w-5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </nav>

          <Separator className="my-4 bg-zinc-800" />

          {/* Settings with Dropdown */}
          <nav className="space-y-1 py-2">
            {!collapsed ? (
              <div>
                <button
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-zinc-900 hover:text-white",
                    pathname.startsWith('/app/settings')
                      ? "bg-gradient-to-r from-blue-600/10 to-blue-500/5 text-white border-l-2 border-blue-500"
                      : "text-zinc-400"
                  )}
                >
                  <SettingsIcon className={cn("h-5 w-5 flex-shrink-0", pathname.startsWith('/app/settings') && "text-blue-500")} />
                  <span className="flex-1 text-left">Settings</span>
                  <ChevronDownIcon 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      settingsExpanded && "rotate-180"
                    )} 
                  />
                </button>
                
                {/* Settings Submenu */}
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    settingsExpanded ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="space-y-1 pl-2 relative">
                    {/* Continuous vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800 rounded-full" />
                    
                    {settingsSubItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 relative ml-2",
                            "hover:bg-zinc-900 hover:text-white",
                            isActive
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-500"
                          )}
                        >
                          {/* Active indicator dot */}
                          {isActive && (
                            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500 z-10" />
                          )}
                          <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-blue-500")} />
                          <span className="flex-1">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/app/settings"
                    className={cn(
                      "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-zinc-900 hover:text-white",
                      pathname.startsWith('/app/settings')
                        ? "bg-gradient-to-r from-blue-600/10 to-blue-500/5 text-white border-l-2 border-blue-500"
                        : "text-zinc-400"
                    )}
                  >
                    <SettingsIcon className={cn("h-5 w-5 flex-shrink-0", pathname.startsWith('/app/settings') && "text-blue-500")} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                  <div className="space-y-2">
                    <p className="font-medium">Settings</p>
                    <div className="space-y-1 text-xs text-zinc-400">
                      {settingsSubItems.map((item) => (
                        <p key={item.href}>• {item.title}</p>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </nav>
        </ScrollArea>

        {/* User Profile Section */}
        <div className="border-t border-zinc-800 p-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold cursor-pointer hover:scale-110 transition-transform">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <LogOutIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                <div className="space-y-1">
                  <p className="font-medium">{user?.firstName || 'User'}</p>
                  <p className="text-xs text-zinc-400">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
