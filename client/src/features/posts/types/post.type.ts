export interface Post {
  id: string | number;
  userName: string;
  userAvatarUrl?: string;
  date: string;
  device: string;
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
}
