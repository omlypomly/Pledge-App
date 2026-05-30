"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Bell,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Flame,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
  /** If set, the link is only active when the path exactly equals href */
  exact?: boolean;
  /** Optional badge count */
  badge?: number;
}

interface NavbarProps {
  /** Overrides the default nav links */
  links?: NavLink[];
  /** Makes the bar transparent initially and adds scroll-based blur */
  transparent?: boolean;
  /** Shows a back-to-dashboard link on non-root paths */
  showDashboardLink?: boolean;
  /** Extra class for the outer <header> element */
  className?: string;
}

/* ─────────────────────────────────────────────
   DEFAULT NAV LINKS
───────────────────────────────────────────── */
const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Leaderboard", href: "/#leaderboard" },
  { label: "Pricing", href: "/#pricing" },
];

const AUTH_NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", exact: true },
  { label: "Challenges", href: "/challenges" },
  { label: "Leaderboard", href: "/leaderboard" },
];

/* ─────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────── */
function NavLogo({ showText = true }: { showText?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0 group"
      aria-label="Pledge. home"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#91C687] to-[#785964] shadow-lg shadow-[#91C687]/30 group-hover:shadow-[#91C687]/50 transition-shadow duration-200">
        <Trophy className="w-4 h-4 text-white" />
      </div>
      {showText && (
        <span className="font-bold text-lg bg-gradient-to-r from-[#D9F6FF] via-[#AFC2D5] to-pink-300 bg-clip-text text-transparent tracking-tight">
          Pledge.
        </span>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────── */
function NotificationBell({ count = 0 }: { count?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
      >
        <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-[#91C687] text-[10px] font-bold text-white px-1 shadow-lg shadow-[#91C687]/30">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#263228] border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            {count > 0 && (
              <span className="text-xs text-[#91C687] hover:text-[#91C687] cursor-pointer font-medium">
                Mark all read
              </span>
            )}
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 text-white/15 mx-auto mb-2" />
              <p className="text-sm text-white/35 font-medium">
                No notifications
              </p>
              <p className="text-xs text-white/20 mt-0.5">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {/* Sample notifications — in production, map real data */}
              {[
                {
                  icon: "🏆",
                  title: "Challenge milestone due",
                  body: "Your Week 4 check-in for 'Lose 20lbs' is due today.",
                  time: "2m ago",
                  unread: true,
                },
                {
                  icon: "💰",
                  title: "Prize pool updated",
                  body: "2 new participants joined your running challenge.",
                  time: "1h ago",
                  unread: true,
                },
                {
                  icon: "✅",
                  title: "Milestone approved",
                  body: "Your Week 3 submission was approved (96% confidence).",
                  time: "3h ago",
                  unread: false,
                },
              ]
                .slice(0, count)
                .map((n, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 px-4 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors",
                      n.unread && "bg-[#91C687]/[0.04]"
                    )}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#91C687] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/45 leading-relaxed mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-white/25 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-white/[0.06]">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-[#91C687] hover:text-[#91C687] transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────── */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  isSignedIn: boolean;
  pathname: string;
}

function MobileMenu({
  isOpen,
  onClose,
  links,
  isSignedIn,
  pathname,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-white/[0.06] bg-[#263228]/98 backdrop-blur-xl">
      <nav className="px-4 py-3 space-y-1">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href.replace("/#", "/"));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#91C687]/15 text-[#91C687]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{link.label}</span>
              {link.badge && link.badge > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#91C687] text-[10px] font-bold text-white px-1.5">
                  {link.badge > 9 ? "9+" : link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!isSignedIn && (
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2 border-t border-white/[0.06] mt-1">
          <Link
            href="/sign-in"
            onClick={onClose}
            className="block px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-center transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={onClose}
            className="block px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#91C687] to-[#785964] text-white text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────────── */
export function Navbar({
  links,
  transparent = false,
  className,
}: NavbarProps) {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine which set of nav links to use
  const resolvedLinks =
    links ?? (isSignedIn ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS);

  // Scroll detection for glass effect
  useEffect(() => {
    if (!transparent) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Mock notification count (replace with real data from your API/store)
  const notificationCount = 3;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#303D31]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/40"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">
          {/* Logo */}
          <NavLogo />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {resolvedLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : link.href !== "/" &&
                  !link.href.startsWith("/#") &&
                  pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white bg-[#91C687]/10"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[#91C687] text-[10px] font-bold text-white px-1">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-[#91C687] to-[#785964] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {!isLoaded ? (
              /* Loading skeleton */
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse hidden sm:block" />
              </div>
            ) : isSignedIn ? (
              /* Authenticated state */
              <>
                {/* XP / streak indicator */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/15">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-300">
                    {user?.publicMetadata?.streak
                      ? `${user.publicMetadata.streak}d streak`
                      : "Start streak"}
                  </span>
                </div>

                {/* Dashboard quick link */}
                <Link
                  href="/dashboard"
                  className={cn(
                    "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith("/dashboard")
                      ? "text-[#91C687] bg-[#91C687]/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Notification bell */}
                <NotificationBell count={notificationCount} />

                {/* Clerk user button */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-8 h-8 ring-2 ring-[#91C687]/30 hover:ring-[#91C687]/60 transition-all duration-200",
                      userButtonPopoverCard: "bg-[#263228] border border-white/10",
                      userButtonPopoverActions: "text-white",
                      userButtonPopoverActionButton:
                        "text-white/70 hover:text-white hover:bg-white/5",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </>
            ) : (
              /* Unauthenticated state */
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#91C687] to-[#785964] hover:from-[#91C687] hover:to-[#785964] text-white transition-all duration-200 shadow-lg shadow-[#91C687]/20 hover:shadow-[#91C687]/35"
                >
                  Get Started
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={resolvedLinks}
        isSignedIn={!!isSignedIn}
        pathname={pathname}
      />
    </header>
  );
}

/* ─────────────────────────────────────────────
   DEFAULT EXPORT (convenience)
───────────────────────────────────────────── */
export default Navbar;
