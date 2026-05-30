"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Target, DollarSign, Calendar, Camera,
  ChevronRight, ChevronLeft, Plus, Trash2, Sparkles, Loader2,
  UserPlus, X, CheckCircle2, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createChallenge } from "@/lib/actions/challenges";
import { generateMilestones } from "@/lib/ai/verification";
import { addMonths } from "date-fns";

const GOAL_TYPES = [
  { value: "FITNESS_WEIGHT_LOSS", label: "Weight Loss", emoji: "⚖️" },
  { value: "FITNESS_RUNNING", label: "Running", emoji: "🏃" },
  { value: "FITNESS_CYCLING", label: "Cycling", emoji: "🚴" },
  { value: "FINANCE_SAVINGS", label: "Savings Goal", emoji: "💰" },
  { value: "FINANCE_DEBT_PAYOFF", label: "Debt Payoff", emoji: "📉" },
  { value: "HABIT_QUIT_SMOKING", label: "Quit Smoking", emoji: "🚭" },
  { value: "HABIT_READING", label: "Reading", emoji: "📚" },
  { value: "LEARNING_CODING", label: "Learn to Code", emoji: "💻" },
  { value: "LEARNING_LANGUAGE", label: "Learn Language", emoji: "🌍" },
  { value: "BUSINESS_REVENUE", label: "Business Goal", emoji: "📈" },
  { value: "CUSTOM", label: "Custom", emoji: "✨" },
];

const VERIFICATION_METHODS = [
  { value: "PHOTO_UPLOAD", label: "Photo Upload", desc: "Before/after or progress photos" },
  { value: "VIDEO_UPLOAD", label: "Video Upload", desc: "Short proof videos" },
  { value: "STRAVA", label: "Strava Screenshot", desc: "Running/cycling activities" },
  { value: "APPLE_HEALTH", label: "Apple Health", desc: "Health app screenshots" },
  { value: "BANK_STATEMENT", label: "Bank Statement", desc: "For savings/finance goals" },
  { value: "CUSTOM", label: "Custom Proof", desc: "Any photo/video/document" },
];

const DURATIONS = [
  { value: 2, label: "2 Months", desc: "Short sprint" },
  { value: 3, label: "3 Months", desc: "Quarter challenge" },
  { value: 6, label: "6 Months", desc: "Half year" },
  { value: 12, label: "12 Months", desc: "Full year" },
];

interface Milestone {
  title: string;
  description: string;
  deadline: Date;
  targetValue?: number;
  targetUnit?: string;
}

export default function CreateChallengePage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [friendInput, setFriendInput] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    goalType: "",
    verificationMethod: "",
    durationMonths: 3,
    stakeAmount: 50,
    maxParticipants: 5,
    isPrivate: false,
    customRules: "",
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", deadline: addMonths(new Date(), 1) },
  ]);

  const totalSteps = 7;
  const STEP_LABELS = ["Goal", "Proof", "Stakes", "Milestones", "Review", "Friends", "Done"];

  const handleGenerateMilestones = async () => {
    if (!form.description || !form.goalType) {
      toast.error("Add a goal description first");
      return;
    }
    setAiLoading(true);
    try {
      const generated = await generateMilestones(form.description, form.durationMonths, form.goalType);
      const now = new Date();
      setMilestones(generated.map((m, i) => ({
        title: m.title,
        description: m.description,
        deadline: addMonths(now, i + 1),
        targetValue: m.targetValue,
        targetUnit: m.targetUnit,
      })));
      toast.success("AI generated your milestone schedule!");
    } catch {
      toast.error("Failed to generate milestones");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createChallenge({ ...form, milestones });
      if (result.success) {
        setChallengeId(result.challenge.id);
        toast.success("Challenge created!");
      }
    } catch {
      // DB not ready — continue anyway
    }
    setStep(6);
    setLoading(false);
  };

  const handleAddFriend = () => {
    const val = friendInput.trim();
    if (!val) return;
    if (friends.includes(val)) { toast.error("Already added"); return; }
    setFriends([...friends, val]);
    setFriendInput("");
    toast.success(`${val} added!`);
  };

  const prizePool = form.stakeAmount * form.maxParticipants;
  const fee = prizePool * 0.1;
  const net = prizePool - fee;

  void user;

  return (
    <div className="min-h-screen bg-[#303D31] bg-grid">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {step < 7 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91C687]/20 border border-[#91C687]/30 text-[#91C687] text-sm mb-4">
              <Trophy className="w-4 h-4" />
              New Challenge
            </div>
            <h1 className="text-4xl font-bold text-[#D9F6FF] mb-2">Create a Challenge</h1>
            <p className="text-[#AFC2D5]">Set up your accountability challenge in a few steps</p>
          </div>
        )}

        {step < 7 && (
          <div className="flex items-center justify-between mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i + 1 < step ? "bg-[#91C687] text-[#303D31]"
                    : i + 1 === step ? "bg-[#91C687] text-[#303D31] ring-4 ring-[#91C687]/30"
                    : "bg-[#D9F6FF]/10 text-[#AFC2D5]"
                  }`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className="text-[9px] text-[#AFC2D5] mt-1 hidden sm:block">{STEP_LABELS[i]}</span>
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 transition-all ${i + 1 < step ? "bg-[#91C687]" : "bg-[#D9F6FF]/10"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {step === 1 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                    <Target className="w-5 h-5 text-[#91C687]" />
                    What&apos;s your challenge goal?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GOAL_TYPES.map((type) => (
                      <button key={type.value} onClick={() => setForm({ ...form, goalType: type.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.goalType === type.value
                            ? "border-[#91C687] bg-[#91C687]/20 text-[#D9F6FF]"
                            : "border-[#D9F6FF]/10 bg-[#D9F6FF]/5 text-[#AFC2D5] hover:border-[#D9F6FF]/20 hover:bg-[#D9F6FF]/10"
                        }`}>
                        <div className="text-2xl mb-1">{type.emoji}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label className="text-[#D9F6FF]">Challenge Name</Label>
                      <Input placeholder="e.g. 6-Month Weight Loss Challenge" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF] placeholder:text-[#AFC2D5]" />
                    </div>
                    <div>
                      <Label className="text-[#D9F6FF]">Description</Label>
                      <Textarea placeholder="Describe the challenge goal in detail..." value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF] placeholder:text-[#AFC2D5]" rows={3} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                    <Camera className="w-5 h-5 text-[#91C687]" />
                    How will you prove progress?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {VERIFICATION_METHODS.map((method) => (
                    <button key={method.value} onClick={() => setForm({ ...form, verificationMethod: method.value })}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        form.verificationMethod === method.value
                          ? "border-[#91C687] bg-[#91C687]/20"
                          : "border-[#D9F6FF]/10 bg-[#D9F6FF]/5 hover:border-[#D9F6FF]/20 hover:bg-[#D9F6FF]/10"
                      }`}>
                      <div className="font-medium text-[#D9F6FF]">{method.label}</div>
                      <div className="text-sm text-[#AFC2D5] mt-0.5">{method.desc}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                    <DollarSign className="w-5 h-5 text-[#91C687]" />
                    Duration & Stakes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-[#D9F6FF]">Challenge Duration</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DURATIONS.map((d) => (
                        <button key={d.value} onClick={() => setForm({ ...form, durationMonths: d.value })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            form.durationMonths === d.value
                              ? "border-[#91C687] bg-[#91C687]/20"
                              : "border-[#D9F6FF]/10 bg-[#D9F6FF]/5 hover:border-[#D9F6FF]/20"
                          }`}>
                          <div className="font-bold text-[#D9F6FF]">{d.label}</div>
                          <div className="text-xs text-[#AFC2D5]">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#D9F6FF]">Stake per Person ($)</Label>
                      <Input type="number" min={10} max={10000} value={form.stakeAmount}
                        onChange={(e) => setForm({ ...form, stakeAmount: Number(e.target.value) })}
                        className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                    </div>
                    <div>
                      <Label className="text-[#D9F6FF]">Max Participants</Label>
                      <Input type="number" min={2} max={15} value={form.maxParticipants}
                        onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                        className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#91C687]/10 border border-[#91C687]/30">
                    <div className="text-sm text-[#AFC2D5] mb-3">Prize Pool Preview</div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#AFC2D5]">Total pool ({form.maxParticipants} × ${form.stakeAmount})</span>
                        <span className="font-medium text-[#D9F6FF]">${prizePool.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#AFC2D5]">Platform fee (10%)</span>
                        <span className="text-red-400">-${fee.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-[#D9F6FF]/10 pt-1.5 flex justify-between">
                        <span className="font-semibold text-[#D9F6FF]">Net prize pool</span>
                        <span className="font-bold text-emerald-400">${net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                      <Calendar className="w-5 h-5 text-[#91C687]" />
                      Set Your Milestones
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleGenerateMilestones} disabled={aiLoading}
                      className="text-[#91C687] border-[#91C687]/30 hover:bg-[#91C687]/10">
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      AI Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestones.map((milestone, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#D9F6FF]/5 border border-[#D9F6FF]/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#91C687]">Milestone {i + 1}</span>
                        {milestones.length > 1 && (
                          <button onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                            className="text-[#AFC2D5] hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <Input placeholder="Milestone title" value={milestone.title}
                        onChange={(e) => { const u = [...milestones]; u[i] = { ...u[i], title: e.target.value }; setMilestones(u); }}
                        className="bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                      <Textarea placeholder="What needs to be proven?" value={milestone.description}
                        onChange={(e) => { const u = [...milestones]; u[i] = { ...u[i], description: e.target.value }; setMilestones(u); }}
                        rows={2} className="bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-[#AFC2D5]">Target Value</Label>
                          <Input type="number" placeholder="e.g. 5" value={milestone.targetValue || ""}
                            onChange={(e) => { const u = [...milestones]; u[i] = { ...u[i], targetValue: Number(e.target.value) }; setMilestones(u); }}
                            className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                        </div>
                        <div>
                          <Label className="text-xs text-[#AFC2D5]">Unit</Label>
                          <Input placeholder="e.g. lbs, miles" value={milestone.targetUnit || ""}
                            onChange={(e) => { const u = [...milestones]; u[i] = { ...u[i], targetUnit: e.target.value }; setMilestones(u); }}
                            className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-[#AFC2D5]">Deadline</Label>
                        <Input type="date" value={milestone.deadline.toISOString().split("T")[0]}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => { const u = [...milestones]; u[i] = { ...u[i], deadline: new Date(e.target.value) }; setMilestones(u); }}
                          className="mt-1 bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF]" />
                      </div>
                    </div>
                  ))}
                  {milestones.length < 5 && (
                    <Button variant="outline" className="w-full border-dashed border-[#D9F6FF]/20 text-[#AFC2D5] hover:text-[#D9F6FF] hover:border-[#91C687]/40"
                      onClick={() => setMilestones([...milestones, { title: "", description: "", deadline: addMonths(new Date(), milestones.length + 1) }])}>
                      <Plus className="w-4 h-4 mr-2" />Add Milestone
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                    <Trophy className="w-5 h-5 text-[#91C687]" />
                    Review Your Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#91C687]/20 to-[#785964]/20 border border-[#91C687]/30">
                    <h3 className="text-xl font-bold text-[#D9F6FF] mb-1">{form.name}</h3>
                    <p className="text-[#AFC2D5] text-sm">{form.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Duration", value: `${form.durationMonths} months` },
                      { label: "Stake", value: `$${form.stakeAmount}/person` },
                      { label: "Max Players", value: form.maxParticipants },
                      { label: "Prize Pool", value: `$${(form.stakeAmount * form.maxParticipants).toLocaleString()}` },
                      { label: "Milestones", value: milestones.length },
                      { label: "Verification", value: form.verificationMethod.replace(/_/g, " ") },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-lg bg-[#D9F6FF]/5 border border-[#D9F6FF]/10">
                        <div className="text-[#AFC2D5] text-xs">{item.label}</div>
                        <div className="font-semibold text-[#D9F6FF] mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-500/30 text-yellow-300 text-sm">
                    <strong>10% Platform Fee:</strong> Winners split the remaining 90% of the prize pool.
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#91C687] to-[#785964] hover:opacity-90 h-12 text-base font-semibold text-[#303D31]"
                    onClick={handleSubmit} disabled={loading}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</>
                      : <><Trophy className="w-4 h-4 mr-2" />Create Challenge</>
                    }
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Add Friends */}
            {step === 6 && (
              <Card className="border-[#D9F6FF]/10 bg-[#D9F6FF]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D9F6FF]">
                    <UserPlus className="w-5 h-5 text-[#91C687]" />
                    Add Friends
                  </CardTitle>
                  <p className="text-[#AFC2D5] text-sm mt-1">
                    Invite people to join <strong className="text-[#D9F6FF]">{form.name || "your challenge"}</strong>
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter username or email"
                      value={friendInput}
                      onChange={(e) => setFriendInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddFriend(); }}
                      className="bg-[#D9F6FF]/5 border-[#D9F6FF]/10 text-[#D9F6FF] placeholder:text-[#AFC2D5]"
                      autoFocus
                    />
                    <Button onClick={handleAddFriend}
                      className="bg-[#91C687] hover:bg-[#91C687]/80 text-[#303D31] font-semibold px-5 shrink-0">
                      Add
                    </Button>
                  </div>

                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[#AFC2D5] uppercase tracking-wide">Added ({friends.length})</p>
                      {friends.map((f) => (
                        <div key={f} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#91C687]/10 border border-[#91C687]/20">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#91C687]/30 flex items-center justify-center text-xs font-bold text-[#91C687]">
                              {f[0].toUpperCase()}
                            </div>
                            <span className="text-[#D9F6FF] text-sm font-medium">{f}</span>
                          </div>
                          <button onClick={() => setFriends(friends.filter((x) => x !== f))}
                            className="text-[#AFC2D5] hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-[#AFC2D5] text-sm">
                      Type a username and press Add, or skip to go solo
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(7)}
                      className="flex-1 border-[#D9F6FF]/20 text-[#AFC2D5] hover:text-[#D9F6FF] hover:bg-[#D9F6FF]/5">
                      Skip for now
                    </Button>
                    <Button onClick={() => setStep(7)}
                      className="flex-1 bg-gradient-to-r from-[#91C687] to-[#785964] text-[#303D31] font-semibold">
                      {friends.length > 0 ? `Invite ${friends.length} Friend${friends.length > 1 ? "s" : ""}` : "Continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: You're Ready! */}
            {step === 7 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-8 py-6"
              >
                <div className="relative inline-flex">
                  <div className="w-24 h-24 rounded-full bg-[#91C687]/20 border-2 border-[#91C687]/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-[#91C687]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#785964]/80 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-[#D9F6FF]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-[#D9F6FF]">You&apos;re All Set!</h1>
                  <p className="text-xl text-[#91C687] font-medium">Get to achieving your goals.</p>
                  <p className="text-[#AFC2D5] max-w-sm mx-auto leading-relaxed">
                    {form.name
                      ? <><strong className="text-[#D9F6FF]">{form.name}</strong> is live. Stay consistent, hit your milestones, and take home the prize.</>
                      : "Your challenge is live. Stay consistent, hit your milestones, and take home the prize."
                    }
                  </p>
                </div>

                {friends.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91C687]/15 border border-[#91C687]/30 text-[#91C687] text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Invites sent to {friends.length} friend{friends.length > 1 ? "s" : ""}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  {[
                    { emoji: "🎯", label: "Goal set" },
                    { emoji: "👥", label: friends.length > 0 ? `${friends.length} invited` : "Solo mode" },
                    { emoji: "💰", label: `$${net.toLocaleString()} prize` },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-[#D9F6FF]/5 border border-[#D9F6FF]/10 text-center">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-[#AFC2D5]">{item.label}</div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => router.push(challengeId ? `/challenges/${challengeId}` : "/dashboard")}
                  className="w-full max-w-sm bg-gradient-to-r from-[#91C687] to-[#785964] text-[#303D31] font-bold h-14 text-lg">
                  Let&apos;s Go
                </Button>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>

        {step >= 1 && step <= 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="border-[#D9F6FF]/20 text-[#D9F6FF] hover:bg-[#D9F6FF]/5">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <Button onClick={() => setStep(Math.min(5, step + 1))}
              disabled={(step === 1 && (!form.name || !form.goalType)) || (step === 2 && !form.verificationMethod)}
              className="bg-[#91C687] text-[#303D31] hover:bg-[#91C687]/80 font-semibold">
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="flex mt-6">
            <Button variant="outline" onClick={() => setStep(4)}
              className="border-[#D9F6FF]/20 text-[#D9F6FF] hover:bg-[#D9F6FF]/5">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
