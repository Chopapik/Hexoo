import { mockPosts } from "../mocks/posts.mock";
import type { Post } from "../types/post.type";
import { PostCard } from "./PostLayout";

type PostListProps = {
  className?: string;
  posts?: Post[];
};

const joinClassNames = (className?: string) =>
  ["w-full", className].filter(Boolean).join(" ");

export const PostList = ({
  className = "",
  posts = mockPosts,
}: PostListProps) => {
  return (
    <main className={joinClassNames(className)}>
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};
