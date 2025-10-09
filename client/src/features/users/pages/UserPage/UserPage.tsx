import type { UserProfile } from "@/features/users/types/user-profile.type";
import { UserProfileCard } from "./components/UserProfileCard";
import { PostList } from "@/features/posts/components/PostList";

const userMockData: UserProfile = {
  username: "Test",
  joinedAt: new Date("2024-10-01T00:00:00"),
  lastOnline: new Date("2024-11-11T15:34:00"),
  postsCount: 12,
  avatarUrl: "https://placehold.co/120x120",
};

export const UserPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <UserProfileCard {...userMockData} />
      <PostList />
    </div>
  );
};
