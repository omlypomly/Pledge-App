"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { levelFromXp, xpForLevel } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Plus,
  Medal,
  User,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Exact match only (default: false — startsWith) */
  exact?: boolean;
  /** Badge count to display */
  badge?: number;
  /** If true, applies a gradient/highlight style to the item */
  highlight?: boolean;
  /** If true, only shows when isAdmin is true */
  adminOnly?: boolean;
}

interface SidebarProps {
  /** Whether the logged-in user has admin privileges */
  isAdmin?: boolean;
  /** Total XP of the current user (used for level/progress bar) */
  userXp?: number;
  /** User display name override (falls back to Clerk display name) */
  displayName?: string;
  /** User level label override */
  levelLabel?: string;
  /** Extra className for the outer <aside> */
  className?: string;
}

/* ─────────────────────────────────────────────
   NAV ITEMS CONFIG
───────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My Challenges",
    href: "/challenges",
    icon: Trophy,
  },
  {
    label: "Create",
    href: "/challenges/create",
    icon: Plus,
    highlight: true,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: Medal,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
    adminOnly: true,
  },
];

/* ─────────────────────────────────────────────
   LEVEL LABELS
───────────────────────────────────────────── */
function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Rookie",
    2: "Challenger",
    3: "Contender",
    4: "Competitor",
    5: "Veteran",
    6: "Elite",
    7: "Champion",
    8: "Legend",
    9: "Mythic",
    10: "Icon",
  };
  return titles[Math.min(level, 10)] ?? "Icon";
}

function getLevelColor(level: number): string {
  if (level <= 2) return "from-slate-400 to-slate-300";
  if (level <= 4) return "from-green-400 to-emerald-300";
  if (level <= 6) return "from-blue-400 to-cyan-300";
  if (level <= 8) return "from-[#91C687] to-[#AFC2D5]";
  return "from-amber-400 to-orange-300";
}

function getLevelBarColor(level: number): string {
  if (level <= 2) return "from-slate-500 to-slate-400";
  if (level <= 4) return "from-green-500 to-emerald-400";
  if (level <= 6) return "from-blue-500 to-cyan-400";
  if (level <= 8) return "from-[#91C687] to-[#785964]";
  return "from-amber-500 to-orange-400";
}

/* ─────────────────────────────────────────────
   XP PROGRESS BAR
───────────────────────────────────────────── */
interface XpBarProps {
  xp: number;
  collapsed: boolean;
}

function XpProgressBar({ xp, collapsed }: XpBarProps) {
  const level = levelFromXp(xp);
  const xpForCurrentLevel = xpForLevel(level);

  // XP accumulated toward the current level (partial progress)
  let xpAtStartOfLevel = 0;
  for (let l = 1; l < level; l++) {
    xpAtStartOfLevel += xpForLevel(l);
  }
  const xpIntoLevel = xp - xpAtStartOfLevel;
  const progress = Math.min((xpIntoLevel / xpForCurrentLevel) * 100, 100);
  const levelTitle = getLevelTitle(level);
  const levelGradient = getLevelColor(level);
  const barGradient = getLevelBarColor(level);

  if (collapsed) {
    return (
      <div className="px-2 py-3 flex flex-col items-center gap-2">
        {/* Level badge */}
        <div
          className={cn(
            "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-black text-white shadow-md",
            levelGradient
          )}
          title={`Level ${level} — ${levelTitle} (${xp} XP)`}
        >
          {level}
        </div>
        {/* Tiny circular progress indicator */}
        <div className="w-6 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", barGradient)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Level row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-black text-white shadow-md shrink-0",
              levelGradient
            )}
          >
            {level}
          </div>
          <div className="leading-none">
            <p className="text-xs font-bold text-white">Level {level}</p>
            <p
              className={cn(
                "text-[10px] font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                levelGradient
              )}
            >
              {levelTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/30 font-medium">
          <Star className="w-3 h-3 text-amber-400" />
          <span>{xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700",
            barGradient
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* XP label */}
      <div className="flex justify-between mt-1.5 text-[10px] text-white/25">
        <span>{xpIntoLevel} XP</span>
        <span>{xpForCurrentLevel} XP to next</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV ITEM
───────────────────────────────────────────── */
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

function SidebarNavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group",
        collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5",
        isActive
          ? "bg-[#785964]/20 text-[#91C687] border border-[#91C687]/30 shadow-sm shadow-[#91C687]/10"
          : item.highlight
          ? [
              "text-[#91C687] border border-[#91C687]/20",
              "hover:bg-[#91C687]/10 hover:text-[#91C687] hover:border-[#91C687]/40",
            ]
          : "text-white/55 hover:text-white hover:bg-white/[0.06] border border-transparent"
      )}
    >
      {/* Icon */}
      <Icon
        className={cn(
          "shrink-0 transition-colors duration-200",
          collapsed ? "w-5 h-5" : "w-4 h-4",
          isActive
            ? "text-[#91C687]"
            : item.highlight
            ? "text-[#91C687] group-hover:text-[#91C687]"
            : "text-current"
        )}
      />

      {/* Label + badge (non-collapsed) */}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {typeof item.badge === "number" && item.badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#91C687] text-[10px] font-bold text-white px-1.5 shadow-sm shadow-[#91C687]/30">
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </>
      )}

      {/* Dot badge (collapsed) */}
      {collapsed && typeof item.badge === "number" && item.badge > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#91C687] shadow-sm shadow-[#91C687]/50" />
      )}

      {/* Active indicator line */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#91C687] rounded-r-full" />
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   COLLAPSE BUTTON
───────────────────────────────────────────── */
function CollapseButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex items-center justify-center w-6 h-6 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all duration-200 shrink-0",
        collapsed ? "mx-auto" : "ml-auto"
      )}
    >
      {collapsed ? (
        <ChevronRight className="w-3.5 h-3.5" />
      ) : (
        <ChevronLeft className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MOBILE OVERLAY SIDEBAR
   Renders as a slide-in drawer on small screens
───────────────────────────────────────────── */
interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function MobileOverlay({ isOpen, onClose, children }: MobileOverlayProps) {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN SIDEBAR
───────────────────────────────────────────── */
export function Sidebar({
  isAdmin = false,
  userXp = 0,
  displayName,
  levelLabel,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve display name
  const resolvedName =
    displayName ??
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "My Account";

  // Resolve XP from user metadata if not explicitly provided
  const resolvedXp =
    userXp > 0
      ? userXp
      : typeof user?.publicMetadata?.xp === "number"
      ? (user.publicMetadata.xp as number)
      : 0;

  // Filter items
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* ───────────────────────
     INNER SIDEBAR CONTENT
  ─────────────────────── */
  function SidebarContent({ isDrawer = false }: { isDrawer?: boolean }) {
    const effectiveCollapsed = isDrawer ? false : collapsed;

    return (
      <aside
        className={cn(
          "flex flex-col h-screen bg-[#263228] border-r border-white/[0.07] transition-all duration-300",
          effectiveCollapsed ? "w-[68px]" : "w-[240px]",
          className
        )}
      >
        {/* ── Logo + collapse button ── */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-white/[0.07] shrink-0",
            effectiveCollapsed ? "justify-center px-2" : "gap-3"
          )}
        >
          {/* Logo mark */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#91C687] to-[#785964] shadow-lg shadow-[#91C687]/30 shrink-0 hover:shadow-[#91C687]/50 transition-shadow duration-200"
            aria-label="Pledge. Dashboard"
          >
            <Zap className="w-4 h-4 text-white" />
          </Link>

          {!effectiveCollapsed && (
            <>
              <Link
                href="/dashboard"
                className="font-bold text-lg bg-gradient-to-r from-[#D9F6FF] via-[#AFC2D5] to-[#785964] bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-opacity"
              >
                Pledge.
              </Link>
              <CollapseButton
                collapsed={effectiveCollapsed}
                onClick={() => setCollapsed(true)}
              />
            </>
          )}

          {effectiveCollapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute right-0 translate-x-full top-5 flex items-center justify-center w-5 h-6 rounded-r-md bg-[#263228] border border-l-0 border-white/[0.07] text-white/30 hover:text-white transition-colors z-10"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4 space-y-1",
            effectiveCollapsed ? "px-2" : "px-3"
          )}
          aria-label="Main navigation"
        >
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={effectiveCollapsed}
              />
            );
          })}

          {/* Divider before admin */}
          {isAdmin && (
            <div className="pt-2 pb-1">
              <div className="h-px bg-white/[0.05] mx-2" />
            </div>
          )}
        </nav>

        {/* ── XP Progress Bar ── */}
        <div className="border-t border-white/[0.07] shrink-0">
          <XpProgressBar xp={resolvedXp} collapsed={effectiveCollapsed} />
        </div>

        {/* ── User Profile Footer ── */}
        <div
          className={cn(
            "flex items-center border-t border-white/[0.07] shrink-0",
            effectiveCollapsed
              ? "justify-center px-2 py-3"
              : "gap-3 px-4 py-3"
          )}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 ring-1 ring-[#91C687]/25 hover:ring-[#91C687]/50 transition-all duration-200",
                userButtonPopoverCard:
                  "bg-[#263228] border border-white/10 shadow-2xl shadow-black/60",
                userButtonPopoverActions: "text-white",
                userButtonPopoverActionButton:
                  "text-white/70 hover:text-white hover:bg-white/5",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />

          {!effectiveCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {resolvedName}
              </p>
              {levelLabel ? (
                <p className="text-xs text-white/35 truncate">{levelLabel}</p>
              ) : (
                <p className="text-xs text-white/35 truncate">
                  {getLevelTitle(levelFromXp(resolvedXp))} ·{" "}
                  {resolvedXp.toLocaleString()} XP
                </p>
              )}
            </div>
          )}

          {!effectiveCollapsed && (
            <button
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/5 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex h-screen sticky top-0 z-40">
        <SidebarContent />
      </div>

      {/* Mobile toggle button — shown below lg */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-xl bg-[#263228] border border-white/10 text-white/60 hover:text-white shadow-lg shadow-black/40 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <LayoutDashboard className="w-4 h-4" />
      </button>

      {/* Mobile overlay drawer */}
      <MobileOverlay isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarContent isDrawer={true} />
      </MobileOverlay>
    </>
  );
}

export default Sidebar;
