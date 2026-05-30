import { http, HttpResponse } from "msw";

const now = "2024-04-01T10:30:00.000Z";

export const mswHandlers = {
  posts: [
    http.get("/api/posts", () =>
      HttpResponse.json([
        {
          id: "post-1",
          userId: "user-1",
          userName: "Ada Hex",
          userAvatarUrl: null,
          text: "Storybook is rendering this post from the shared MSW handler.",
          likesCount: 12,
          commentsCount: 2,
          createdAt: now,
          updatedAt: now,
          isPending: false,
          isNSFW: false,
          isEdited: false,
          imageMeta: null,
          device: "desktop",
          youtubeUrl: null,
          imageUrl: null,
          isLikedByMe: false,
        },
      ]),
    ),
    http.get("/api/posts/:postId/comments", () =>
      HttpResponse.json([
        {
          id: "comment-1",
          postId: "post-1",
          userId: "user-2",
          userName: "Mira",
          userAvatarUrl: null,
          text: "This comment arrived through MSW.",
          likesCount: 1,
          commentsCount: 0,
          createdAt: now,
          updatedAt: now,
          isPending: false,
          isNSFW: false,
          isEdited: false,
          imageMeta: null,
          device: "mobile",
          youtubeUrl: null,
          imageUrl: null,
          isLikedByMe: false,
        },
      ]),
    ),
  ],
  users: [
    http.get("/api/user/profile/:uid", ({ params }) =>
      HttpResponse.json({
        user: {
          uid: String(params.uid),
          name: "Ada Hex",
          avatarUrl: null,
          createdAt: "2023-10-12T08:00:00.000Z",
          lastOnline: "2024-04-01T11:45:00.000Z",
        },
      }),
    ),
    http.post("/api/users/by-ids", async ({ request }) => {
      const body = (await request.json()) as { uids?: string[] };
      const namesByUid: Record<string, string> = {
        "user-1": "Ada Hex",
        "user-2": "Mira",
        "user-3": "Jan",
      };

      return HttpResponse.json({
        users: (body.uids ?? []).map((uid) => ({
          uid,
          name: namesByUid[uid] ?? uid,
          avatarUrl: null,
        })),
      });
    }),
  ],
};
