export type Post = {
  id: string;
  user_id: string;
  platform: "instagram" | "tiktok";
  caption: string | null;
  thumbnail_url: string | null;
  media_type: "image" | "video" | "carousel";
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number | null;
  permalink: string | null;
  created_at: string;
};

export type DailyMetric = {
  id: string;
  user_id: string;
  date: string;
  engagement: number;
  reach: number;
  created_at: string;
};
