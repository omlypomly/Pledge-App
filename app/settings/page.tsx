"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, acceptTerms } from "@/lib/actions/users";
import { User, Bell, CreditCard, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
  );
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ displayName, username: username || undefined, bio: bio || undefined });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-violet-400" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-white/60">Profile photo is managed by your Clerk account</p>
                  <p className="text-xs text-white/40">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>

              <div>
                <Label>Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="@yourusername"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1"
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="w-4 h-4 text-violet-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Milestone deadlines", desc: "24h and 1h reminders", enabled: true },
                { label: "Community votes needed", desc: "When submissions need your vote", enabled: true },
                { label: "Elimination alerts", desc: "When someone is eliminated", enabled: false },
                { label: "Challenge updates", desc: "New participants, chat messages", enabled: false },
                { label: "Payout notifications", desc: "When prizes are distributed", enabled: true },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{notif.label}</div>
                    <div className="text-xs text-white/40">{notif.desc}</div>
                  </div>
                  <button
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notif.enabled ? "bg-violet-600" : "bg-white/20"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white mx-auto transition-transform ${notif.enabled ? "translate-x-2.5" : "-translate-x-2.5"}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="w-4 h-4 text-violet-400" />
                Payment & Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/60">
                Connect your Stripe account to receive winnings directly to your bank.
              </p>
              <Button variant="outline" className="w-full">
                Connect Stripe Account
              </Button>
              <p className="text-xs text-white/30 text-center">
                Powered by Stripe Connect. Your banking info is never stored on our servers.
              </p>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-4 h-4 text-violet-400" />
                Legal & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Terms of Service</div>
                  <div className="text-xs text-white/40">Last accepted: Today</div>
                </div>
                <Badge variant="success">Accepted</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Age Verification (18+)</div>
                  <div className="text-xs text-white/40">Required to participate</div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
              <div className="pt-2 flex gap-3 text-xs text-white/40">
                <a href="/terms" className="hover:text-white/70 underline">Terms of Service</a>
                <a href="/privacy" className="hover:text-white/70 underline">Privacy Policy</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
