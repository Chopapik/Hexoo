import { mockPosts } from "../mocks/posts.mock";
import type { Post } from "../types/post.type";
import { PostCard } from "./PostLayout";

type PostListProps = {
  className?: string;
};

const joinClassNames = (className?: string) =>
  ["w-full", className].filter(Boolean).join(" ");

export const PostList = ({ className = "" }: PostListProps) => {
  return (
    <main className={joinClassNames(className)}>
      <div className="space-y-4">
        {mockPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};
