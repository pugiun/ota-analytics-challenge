"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";

export function usePosts() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as Post[];
    },
  });
}
