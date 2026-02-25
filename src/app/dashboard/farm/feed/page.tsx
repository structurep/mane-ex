import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPosts } from "@/actions/barn-posts";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";

export default async function BarnFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Find user's farm (as owner or staff)
  const { data: ownedFarm } = await supabase
    .from("farms")
    .select("id, name, owner_id")
    .eq("owner_id", user.id)
    .single();

  const { data: staffEntry } = !ownedFarm
    ? await supabase
        .from("farm_staff")
        .select("farm_id, role, farm:farms(id, name, owner_id)")
        .eq("user_id", user.id)
        .limit(1)
        .single()
    : { data: null };

  const staffFarm = staffEntry?.farm as unknown as { id: string; name: string; owner_id: string } | null;
  const farm = ownedFarm ?? staffFarm;

  if (!farm) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
            Barn Feed
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Join or create a barn to access the community feed.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = farm.owner_id === user.id;
  const { posts } = await getPosts(farm.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">
          Barn Feed
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Updates and conversations at {farm.name}.
        </p>
      </div>

      {/* Composer */}
      <PostComposer farmId={farm.id} />

      {/* Posts */}
      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-lg border-0 bg-paper-cream p-8 text-center shadow-flat">
            <p className="text-sm text-ink-mid">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id as string}
              post={post}
              currentUserId={user.id}
              isOwner={isOwner}
            />
          ))
        )}
      </div>
    </div>
  );
}
