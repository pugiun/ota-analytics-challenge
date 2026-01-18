"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bookmark,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import type { Post } from "@/types/database";

type PostDetailModalProps = {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
} as const;

const metricVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
} as const;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      variants={metricVariants}
      className="flex items-center gap-3 rounded-lg border p-3"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}

export function PostDetailModal({
  post,
  open,
  onOpenChange,
}: PostDetailModalProps) {
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      // Escape is handled by Radix Dialog
      // Add any custom keyboard shortcuts here
      if (e.key === "v" && (e.metaKey || e.ctrlKey) && post?.permalink) {
        e.preventDefault();
        window.open(post.permalink, "_blank", "noopener,noreferrer");
      }
    },
    [open, post],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!post) return null;

  const totalEngagement = post.likes + post.comments + post.shares;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key={post.id}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <motion.span
                    variants={itemVariants}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.platform === "instagram"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {post.platform.charAt(0).toUpperCase() +
                      post.platform.slice(1)}
                  </motion.span>
                  <motion.span
                    variants={itemVariants}
                    className="text-sm font-normal text-muted-foreground"
                  >
                    {post.media_type.charAt(0).toUpperCase() +
                      post.media_type.slice(1)}
                  </motion.span>
                </DialogTitle>
                <motion.div variants={itemVariants}>
                  <DialogDescription>
                    {formatDate(post.posted_at)}
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Thumbnail */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center"
                >
                  {post.thumbnail_url ? (
                    <motion.img
                      src={post.thumbnail_url}
                      alt="Post thumbnail"
                      className="max-h-64 w-auto rounded-lg object-contain shadow-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: 0.2,
                      }}
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      No thumbnail available
                    </div>
                  )}
                </motion.div>

                {/* Caption */}
                {post.caption && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-lg bg-muted/50 p-4"
                  >
                    <p className="text-sm leading-relaxed">{post.caption}</p>
                  </motion.div>
                )}

                {/* Engagement Metrics */}
                <motion.div variants={itemVariants}>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    Engagement Metrics
                  </h3>
                  <motion.div
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <MetricItem
                      icon={Heart}
                      label="Likes"
                      value={formatNumber(post.likes)}
                    />
                    <MetricItem
                      icon={MessageCircle}
                      label="Comments"
                      value={formatNumber(post.comments)}
                    />
                    <MetricItem
                      icon={Share2}
                      label="Shares"
                      value={formatNumber(post.shares)}
                    />
                    <MetricItem
                      icon={Bookmark}
                      label="Saves"
                      value={formatNumber(post.saves)}
                    />
                    <MetricItem
                      icon={Eye}
                      label="Reach"
                      value={formatNumber(post.reach)}
                    />
                    <MetricItem
                      icon={BarChart3}
                      label="Impressions"
                      value={formatNumber(post.impressions)}
                    />
                  </motion.div>
                </motion.div>

                {/* Summary Stats */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Engagement
                      </p>
                      <p className="text-xl font-bold">
                        {formatNumber(totalEngagement)}
                      </p>
                    </div>
                  </div>
                  {post.engagement_rate !== null && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Engagement Rate
                      </p>
                      <p className="text-xl font-bold">
                        {post.engagement_rate}%
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* View on Platform Button */}
                {post.permalink && (
                  <motion.div variants={itemVariants}>
                    <Button asChild className="w-full" size="lg">
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 size-4" />
                        View on{" "}
                        {post.platform.charAt(0).toUpperCase() +
                          post.platform.slice(1)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Ctrl+V)
                        </span>
                      </a>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
