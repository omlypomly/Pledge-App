"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Pusher from "pusher-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isSystem?: boolean;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ChallengeChatProps {
  challengeId: string;
}

export default function ChallengeChat({ challengeId }: ChallengeChatProps) {
  const { user: clerkUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chat?challengeId=${challengeId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [challengeId]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`challenge-${challengeId}`);
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        return exists ? prev : [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`challenge-${challengeId}`);
    };
  }, [challengeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, content }),
      });
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-white/40">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-sm py-8">
            No messages yet. Say hi! 👋
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.user.id === clerkUser?.id;

          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={msg.user.avatarUrl ?? ""} />
                <AvatarFallback className="text-xs">
                  {msg.user.displayName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-xs ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                {!isOwn && (
                  <span className="text-xs text-white/50 mb-1">
                    {msg.user.displayName || "Anonymous"}
                  </span>
                )}
                <div
                  className={`px-3 py-2 rounded-xl text-sm ${
                    isOwn
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-white/10 text-white/90 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-white/30 mt-0.5">
                  {formatRelativeTime(new Date(msg.createdAt))}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border-white/10"
          disabled={sending}
          maxLength={1000}
        />
        <Button
          size="icon"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="bg-violet-600 hover:bg-violet-500"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
