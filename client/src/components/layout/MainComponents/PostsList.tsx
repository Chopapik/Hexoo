import React from "react";
import { PostCard, type Post } from "@/components/ui/PostCard";

type MainProps = {
  className?: string;
};

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const posts: Post[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  user: `User_${i + 1}`,
  date: new Date(2024, 0, (i % 28) + 1).toLocaleDateString(),
  device: ["device_name", "iPhone", "Android", "Web"][i % 4],
  body: lorem,
}));

export const PostsList: React.FC<MainProps> = ({ className = "" }) => {
  return (
    <main className={`w-full`}>
      <div className="space-y-4 ">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </main>
  );
};
