import type { Post } from "../types/post.type";

const defaultPostProps = {
  userId: "user-123",
  isNSFW: false,
  moderationStatus: "approved" as const,
};

export const mockPosts: Post[] = [
  {
    ...defaultPostProps,
    id: "post-001",
    userName: "Avery Kim",
    userAvatarUrl: "https://i.pravatar.cc/300?img=11",
    createdAt: new Date("04/12/2024"),
    device: "iPhone",
    text: "Quick update: deployed the streaming fix tonight! 🚀",
    likesCount: 0,
    commentsCount: 0,
  },
  {
    ...defaultPostProps,
    id: "post-002",
    userName: "Jordan Lee",
    userAvatarUrl: "https://i.pravatar.cc/300?img=22",
    createdAt: new Date("04/08/2024"),
    device: "Android",
    text: "Weekly ship: launched analytics filters, redesigned board icons, and tuned search previews for speed. Rollout finished ahead of schedule and beta teams already reported faster audits heading into tomorrow's demo.",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&h=1080&q=80",
    likesCount: 8,
    commentsCount: 3,
  },
  {
    ...defaultPostProps,
    id: "post-003",
    userName: "Rowan Patel",
    userAvatarUrl: "https://i.pravatar.cc/300?img=33",
    createdAt: new Date("03/18/2024"),
    device: "Web",
    text: `After six months of research interviews, we finally merged the accessibility branch into main. The release includes keyboard shortcuts, focus outlines, and better color contrasts for contributors with different vision profiles.

We also rewrote the notification pipeline so it batches updates per workspace instead of per user. The new scheduler handled 3x the traffic in staging without breaking a sweat, and the ops team reported zero dropped messages.

Seeing everyone respond in the pilot group has been both humbling and energizing. Keep sharing screenshots, edge cases, and the "wish we had this earlier" stories - those bits keep the roadmap honest and grounded in real-world use.`,
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&h=1350&q=80",
    likesCount: 87,
    commentsCount: 42,
  },
  {
    ...defaultPostProps,
    id: "post-004",
    userName: "Marta Silva",
    userAvatarUrl: "https://i.pravatar.cc/300?img=44",
    createdAt: new Date("12/02/2023"),
    device: "Tablet",
    text: "Sunset sync from the retreat: we mapped the Q3 OKRs, swapped strategy notes, and still found time for board games & matcha. Remote weeks like this keep the culture sharp.",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&h=900&q=80",
    likesCount: 2405,
    commentsCount: 1189,
  },
  {
    ...defaultPostProps,
    id: "post-005",
    userName: "Noah Bennett",
    userAvatarUrl: "https://i.pravatar.cc/300?img=65",
    createdAt: new Date("01/22/2024"),
    device: "Web",
    text: "Turned on dark mode for staging so QA can finally test the new contrast tokens after hours without eye strain. Thanks to everyone who reviewed the patch between stand-up and lunch.",
    imageUrl: "https://via.placeholder.com/1080x608.png?text=Dark+Mode",
    likesCount: 152,
    commentsCount: 18,
  },
  {
    ...defaultPostProps,
    id: "post-006",
    userName: "Zane Howard",
    createdAt: new Date("09/10/2023"),
    device: "Android",
    text: "Patch notes: #shipit for offline caching and comment syncing. Added retry logic, crushed the Pixel login bug, and cleaned up stale data jobs. Ping me if any edge cases remain.",
    likesCount: 4,
    commentsCount: 1,
  },
  {
    ...defaultPostProps,
    id: "post-007",
    userName: "Priya Desai",
    userAvatarUrl: "https://i.pravatar.cc/300?img=75",
    createdAt: new Date("07/04/2022"),
    device: "Web",
    text: "Throwback to our first fully async launch. Different time zones, same energy - grateful for how far the platform and team have come since then. Celebrating with a tiny 🎉 before diving into the next milestone.",
    imageUrl:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1080&h=1080&q=80",
    likesCount: 65,
    commentsCount: 7,
  },
];
