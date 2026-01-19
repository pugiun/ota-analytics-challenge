import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { DashboardContent } from "@/components/dashboard-content";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.user_metadata?.display_name || user.email}
            </p>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign out
            </Button>
          </form>
        </div>

        <DashboardContent />
      </div>
    </div>
  );
}
