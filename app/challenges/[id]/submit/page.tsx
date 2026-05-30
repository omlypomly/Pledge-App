"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { submitMilestoneProof } from "@/lib/actions/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  FileText,
  Zap,
  ArrowLeft,
  Shield,
  TrendingUp,
  Eye,
  Loader2,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { format } from "date-fns";

type ProofType =
  | "PHOTO_UPLOAD"
  | "VIDEO_UPLOAD"
  | "STRAVA"
  | "APPLE_HEALTH"
  | "GOOGLE_FIT"
  | "BANK_STATEMENT"
  | "CUSTOM";

interface MilestoneInfo {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  targetValue: number | null;
  targetUnit: string | null;
  orderIndex: number;
  challengeName: string;
  challengeId: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: "image" | "video" | "document";
}

interface SubmissionResult {
  success: boolean;
  submissionId: string;
  status: string;
  aiConfidence?: number;
  requiresVoting?: boolean;
}

const PROOF_TYPE_OPTIONS: { value: ProofType; label: string; icon: typeof ImageIcon }[] = [
  { value: "PHOTO_UPLOAD", label: "Photo", icon: ImageIcon },
  { value: "VIDEO_UPLOAD", label: "Video", icon: Video },
  { value: "STRAVA", label: "Strava Activity", icon: TrendingUp },
  { value: "APPLE_HEALTH", label: "Apple Health", icon: Shield },
  { value: "GOOGLE_FIT", label: "Google Fit", icon: Shield },
  { value: "BANK_STATEMENT", label: "Bank Statement", icon: FileText },
  { value: "CUSTOM", label: "Other / Custom", icon: FileText },
];

function getFileType(file: File): "image" | "video" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

function AIConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 80
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : confidence >= 50
      ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
      : "text-red-400 border-red-500/30 bg-red-500/10";

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${color}`}>
      <Zap className="w-3.5 h-3.5" />
      AI Confidence: {Math.round(confidence)}%
    </div>
  );
}

export default function SubmitProofPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const challengeId = params.id as string;
  const milestoneIdParam = searchParams.get("milestone");

  const [milestone, setMilestone] = useState<MilestoneInfo | null>(null);
  const [loadingMilestone, setLoadingMilestone] = useState(true);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [proofType, setProofType] = useState<ProofType>("PHOTO_UPLOAD");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const { startUpload } = useUploadThing("milestoneProof");

  useEffect(() => {
    async function fetchMilestone() {
      try {
        const url = milestoneIdParam
          ? `/api/challenges/${challengeId}/milestones?id=${milestoneIdParam}`
          : `/api/challenges/${challengeId}/milestones/current`;
        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json();
          setMilestoneError(data.error ?? "Milestone not found");
          return;
        }
        const data = await res.json();
        setMilestone(data);
      } catch {
        setMilestoneError("Failed to load milestone. Please try again.");
      } finally {
        setLoadingMilestone(false);
      }
    }
    fetchMilestone();
  }, [challengeId, milestoneIdParam]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
    const processed: UploadedFile[] = newFiles.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      type: getFileType(file),
    }));
    setUploadedFiles((prev) => [...prev, ...processed]);
  }, [uploadedFiles.length]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!milestone) return;
    if (uploadedFiles.length === 0) {
      setSubmitError("Please upload at least one proof file.");
      return;
    }

    setSubmitError(null);
    setIsUploading(true);

    try {
      const uploadRes = await startUpload(uploadedFiles.map((f) => f.file));
      if (!uploadRes || uploadRes.length === 0) {
        throw new Error("File upload failed. Please try again.");
      }
      const proofUrls = uploadRes.map((r) => r.ufsUrl ?? r.url);
      setIsUploading(false);

      startTransition(async () => {
        try {
          const res = await submitMilestoneProof({
            challengeId,
            milestoneId: milestone.id,
            proofUrls,
            proofType,
            notes: notes.trim() || undefined,
          });
          setResult(res);
        } catch (err) {
          setSubmitError(
            err instanceof Error ? err.message : "Submission failed"
          );
        }
      });
    } catch (err) {
      setIsUploading(false);
      setSubmitError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  const isLoading = isPending || isUploading;
  const canSubmit =
    !isLoading && uploadedFiles.length > 0 && milestone !== null;

  // Success state
  if (result) {
    const isApproved = result.status === "APPROVED";
    const needsVoting = result.requiresVoting;

    return (
      <div className="min-h-screen bg-[#080810] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              isApproved
                ? "bg-emerald-500/20 border-2 border-emerald-500"
                : "bg-violet-500/20 border-2 border-violet-500"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
              <Eye className="w-10 h-10 text-violet-400" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isApproved ? "Proof Approved!" : "Submission Received"}
            </h2>
            <p className="text-white/60 text-sm">
              {isApproved
                ? "Your milestone proof passed AI verification. Keep it up!"
                : needsVoting
                ? "Your proof is under community review. You'll be notified when voting completes."
                : "Your submission is being processed."}
            </p>
          </div>

          {result.aiConfidence !== undefined && (
            <div className="flex justify-center">
              <AIConfidenceBadge confidence={result.aiConfidence} />
            </div>
          )}

          <Card className="border-white/10 bg-white/[0.03] text-left">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Submission ID</span>
                <span className="text-white font-mono text-xs">
                  {result.submissionId.slice(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Status</span>
                <Badge
                  variant={
                    isApproved
                      ? "success"
                      : needsVoting
                      ? "warning"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {result.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {result.aiConfidence !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">AI Confidence</span>
                  <span
                    className={`font-bold ${
                      result.aiConfidence >= 80
                        ? "text-emerald-400"
                        : result.aiConfidence >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {Math.round(result.aiConfidence)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/challenges/${challengeId}`}>
                <ArrowLeft className="w-4 h-4" />
                Challenge
              </Link>
            </Button>
            <Button variant="gradient" className="flex-1" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back nav */}
        <Button variant="ghost" size="sm" className="text-white/40 -ml-1" asChild>
          <Link href={`/challenges/${challengeId}`}>
            <ArrowLeft className="w-4 h-4" />
            Back to Challenge
          </Link>
        </Button>

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Submit Proof</h1>
          <p className="text-white/50 text-sm mt-1">
            Upload evidence for your milestone completion
          </p>
        </div>

        {/* Milestone details */}
        {loadingMilestone ? (
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="flex items-center gap-3 p-6">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              <span className="text-white/50 text-sm">Loading milestone...</span>
            </CardContent>
          </Card>
        ) : milestoneError ? (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{milestoneError}</p>
            </CardContent>
          </Card>
        ) : milestone ? (
          <Card className="border-violet-500/30 bg-violet-600/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">
                      Milestone #{milestone.orderIndex}
                    </Badge>
                    <Badge
                      variant={
                        milestone.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {milestone.status}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {milestone.title}
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {milestone.description}
                  </p>
                  {milestone.targetValue && (
                    <p className="text-sm text-violet-400 mt-2 font-medium">
                      Target: {milestone.targetValue} {milestone.targetUnit}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40 mb-1">Deadline</p>
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(milestone.deadline), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-white/40">
                    {format(new Date(milestone.deadline), "h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* AI Verification Info */}
        <Card className="border-violet-500/20 bg-gradient-to-r from-violet-900/10 to-purple-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">
                AI-Powered Verification
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                Our AI will analyze your proof. A confidence score of{" "}
                <strong className="text-violet-400">80% or higher</strong> gets
                instant approval. Lower scores go to community voting (24h
                window).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proof Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white/80">
              Proof Type
            </Label>
            <Select
              value={proofType}
              onValueChange={(v) => setProofType(v as ProofType)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d1a] border-white/10">
                {PROOF_TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-white focus:bg-violet-600/20 focus:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-violet-400" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white/80">
              Upload Files
              <span className="text-white/40 font-normal ml-1">
                (up to 5 files · images 16MB · videos 64MB)
              </span>
            </Label>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                isDragging
                  ? "border-violet-500 bg-violet-500/10"
                  : uploadedFiles.length === 0
                  ? "border-white/20 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadedFiles.length >= 5 || isLoading}
              />
              {uploadedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-violet-400" />
                  </div>
                  <p className="text-white font-medium text-sm">
                    Drag & drop files here
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    or click to browse — photos, videos, screenshots
                  </p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedFiles.map((uf, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5 aspect-square"
                    >
                      {uf.type === "image" && uf.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={uf.preview}
                          alt={uf.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                          {uf.type === "video" ? (
                            <Video className="w-8 h-8 text-violet-400" />
                          ) : (
                            <FileText className="w-8 h-8 text-violet-400" />
                          )}
                          <p className="text-[10px] text-white/50 text-center leading-tight truncate w-full px-1">
                            {uf.file.name}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {uploadedFiles.length < 5 && (
                    <div className="rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center aspect-square hover:border-violet-500/40 transition-colors">
                      <Upload className="w-5 h-5 text-white/30" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <p className="text-xs text-white/40">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white/80">
              Notes{" "}
              <span className="text-white/40 font-normal">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context about your submission — what did you accomplish? Any details that support your proof..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[100px] focus:border-violet-500/50"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-[10px] text-white/30 text-right">
              {notes.length}/500
            </p>
          </div>

          {/* Submission summary */}
          {uploadedFiles.length > 0 && (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Submission Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Files</span>
                  <span className="text-white">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Proof type</span>
                  <span className="text-white">
                    {PROOF_TYPE_OPTIONS.find((o) => o.value === proofType)?.label}
                  </span>
                </div>
                {milestone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Milestone</span>
                    <span className="text-white truncate max-w-[180px]">
                      {milestone.title}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {submitError && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{submitError}</p>
              </CardContent>
            </Card>
          )}

          {/* Upload progress */}
          {isUploading && (
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    Uploading files...
                  </p>
                  <p className="text-xs text-white/40">
                    Please don&apos;t close this page
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isPending && !isUploading && (
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <Zap className="w-4 h-4 text-violet-400 animate-pulse shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">
                    AI is analyzing your proof...
                  </p>
                  <p className="text-xs text-white/40">
                    This usually takes a few seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              asChild
              disabled={isLoading}
            >
              <Link href={`/challenges/${challengeId}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={!canSubmit}
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : isPending ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-white/30 text-center leading-relaxed">
            By submitting, you confirm this proof accurately represents your
            completion of the milestone. Fraudulent submissions may result in
            elimination and account suspension.
          </p>
        </form>
      </div>
    </div>
  );
}
