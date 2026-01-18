"use client";

import { PostsTable } from "@/components/posts/posts-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePosts } from "@/hooks/use-posts";

export function PostsTableContainer() {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Posts</CardTitle>
        <CardDescription>
          All posts across platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex h-32 items-center justify-center text-destructive">
            Error loading posts: {error.message}
          </div>
        ) : (
          <PostsTable posts={posts ?? []} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
}
