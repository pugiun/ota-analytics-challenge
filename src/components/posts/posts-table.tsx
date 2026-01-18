"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { PostDetailModal } from "@/components/posts/post-detail-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type PlatformFilter,
  type SortColumn,
  useDashboardStore,
} from "@/stores/dashboard-store";
import type { Post } from "@/types/database";

function truncateCaption(caption: string | null, maxLength = 50): string {
  if (!caption) return "-";
  if (caption.length <= maxLength) return caption;
  return `${caption.slice(0, maxLength)}...`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SortableHeader({
  column,
  children,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="size-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-4" />
      ) : (
        <ArrowUpDown className="size-4 opacity-50" />
      )}
    </button>
  );
}

const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "thumbnail_url",
    header: "Thumbnail",
    cell: ({ row }) => {
      const url = row.getValue("thumbnail_url") as string | null;
      return url ? (
        <div className="relative size-12">
          <Image
            src={url}
            alt="Post thumbnail"
            fill
            sizes="48px"
            className="rounded object-cover"
          />
        </div>
      ) : (
        <div className="flex size-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
          N/A
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "caption",
    header: "Caption",
    cell: ({ row }) => (
      <span
        className="max-w-[200px] truncate"
        title={row.getValue("caption") || undefined}
      >
        {truncateCaption(row.getValue("caption"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            platform === "instagram"
              ? "bg-pink-100 text-pink-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: "likes",
    header: ({ column }) => (
      <SortableHeader column={column}>Likes</SortableHeader>
    ),
    cell: ({ row }) => (row.getValue("likes") as number).toLocaleString(),
  },
  {
    accessorKey: "comments",
    header: ({ column }) => (
      <SortableHeader column={column}>Comments</SortableHeader>
    ),
    cell: ({ row }) => (row.getValue("comments") as number).toLocaleString(),
  },
  {
    accessorKey: "shares",
    header: ({ column }) => (
      <SortableHeader column={column}>Shares</SortableHeader>
    ),
    cell: ({ row }) => (row.getValue("shares") as number).toLocaleString(),
  },
  {
    accessorKey: "engagement_rate",
    header: ({ column }) => (
      <SortableHeader column={column}>Engagement Rate</SortableHeader>
    ),
    cell: ({ row }) => {
      const rate = row.getValue("engagement_rate") as number | null;
      return rate !== null ? `${rate.toFixed(1)}%` : "-";
    },
  },
  {
    accessorKey: "posted_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Posted Date</SortableHeader>
    ),
    cell: ({ row }) => formatDate(row.getValue("posted_at")),
  },
];

type PostsTableProps = {
  posts: Post[];
  isLoading?: boolean;
};

export function PostsTable({ posts, isLoading }: PostsTableProps) {
  const {
    page,
    pageSize,
    platformFilter,
    sortColumn,
    sortOrder,
    setPage,
    setPageSize,
    setPlatformFilter,
    setSort,
  } = useDashboardStore();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive sorting state from store
  const sorting: SortingState = useMemo(
    () => [{ id: sortColumn, desc: sortOrder === "desc" }],
    [sortColumn, sortOrder]
  );

  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === "function" ? updater(sorting) : updater;
    if (newSorting.length > 0) {
      const { id, desc } = newSorting[0];
      setSort(id as SortColumn, desc ? "desc" : "asc");
    }
  };

  const handleRowClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handlePlatformChange = (value: string) => {
    setPlatformFilter(value as PlatformFilter);
  };

  const filteredData = useMemo(() => {
    if (platformFilter === "all") return posts;
    return posts.filter((post) => post.platform === platformFilter);
  }, [posts, platformFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        if (newState.pageSize !== pageSize) {
          setPageSize(newState.pageSize);
        }
      }
    },
    manualPagination: false,
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-14" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-10" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-18" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, i) => (
                <TableRow
                  key={`skeleton-row-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton rows
                    i
                  }`}
                >
                  <TableCell>
                    <Skeleton className="size-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Filter by platform:
            </span>
            <Select value={platformFilter} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredData.length} post{filteredData.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} posts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
          >
            Last
          </Button>
        </div>
      </div>

      <PostDetailModal
        post={selectedPost}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
