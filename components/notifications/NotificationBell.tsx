"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationsRead } from "@/lib/actions/users";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  challenge?: { id: string; name: string } | null;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!loaded) {
      getNotifications()
        .then((data) => {
          setNotifications(data as Notification[]);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
  }, [loaded]);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const typeEmoji: Record<string, string> = {
    MILESTONE_DUE: "⏰",
    MILESTONE_APPROVED: "✅",
    MILESTONE_REJECTED: "❌",
    ELIMINATED: "🔴",
    CHALLENGE_STARTED: "🚀",
    CHALLENGE_ENDED: "🏁",
    PAYOUT_SENT: "💰",
    VOTE_NEEDED: "🗳️",
    DISPUTE_OPENED: "⚠️",
    BADGE_EARNED: "🏆",
    NEW_PARTICIPANT: "👋",
    CHAT_MESSAGE: "💬",
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative text-white/70 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#91C687] text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      !notif.isRead ? "bg-[#91C687]/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{typeEmoji[notif.type] || "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{notif.title}</div>
                        <div className="text-xs text-white/50 mt-0.5">{notif.body}</div>
                        <div className="text-xs text-white/30 mt-1">
                          {formatRelativeTime(notif.createdAt)}
                        </div>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#91C687] flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
