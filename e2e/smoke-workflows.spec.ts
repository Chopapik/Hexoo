import { expect, test, type BrowserContext, type Page, type Route } from "playwright/test";

type Role = "admin" | "moderator" | "user";

type SessionUser = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  lastOnline: string;
  isRestricted: boolean;
  isBanned: boolean;
};

type Post = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  text: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isPending: boolean;
  isNSFW: boolean;
  isEdited: boolean;
  imageMeta: null;
  device: string | null;
  youtubeUrl: string | null;
  imageUrl: string | null;
  isLikedByMe: boolean;
};

type Comment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  text: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isPending: boolean;
  isNSFW: boolean;
  isEdited: boolean;
  imageMeta: null;
  device: string | null;
  imageUrl: string | null;
  isLikedByMe: boolean;
};

const e2eSessionCookieName = "__hexoo_e2e_session";

function seededPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-e2e-1",
    userId: "author-e2e",
    userName: "Ada Hex",
    userAvatarUrl: null,
    text: "E2E seeded post",
    likesCount: 0,
    commentsCount: 0,
    createdAt: "2026-06-23T10:00:00.000Z",
    updatedAt: "2026-06-23T10:00:00.000Z",
    isPending: false,
    isNSFW: false,
    isEdited: false,
    imageMeta: null,
    device: "e2e",
    youtubeUrl: null,
    imageUrl: null,
    isLikedByMe: false,
    ...overrides,
  };
}

function ok(data: unknown) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data }),
  };
}

function apiError(status: number, code: string) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ ok: false, error: { code } }),
  };
}

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function createLocalSessionUser(
  context: BrowserContext,
  {
    role = "user",
    name = `E2E ${role}`,
    isBanned = false,
  }: {
    role?: Role;
    name?: string;
    isBanned?: boolean;
  } = {},
): Promise<SessionUser> {
  const suffix = uniqueSuffix();
  const email = `e2e-${role}-${suffix}@example.test`;
  const displayName = `${name} ${suffix.slice(-6)}`;
  const user = {
    uid: `e2e-${role}-${suffix}`,
    email,
    name: displayName,
    role,
    avatarUrl: undefined,
    lastOnline: new Date().toISOString(),
    isRestricted: false,
    isBanned,
  } satisfies SessionUser;

  const appUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://127.0.0.1:3100";
  await context.addCookies([
    {
      name: e2eSessionCookieName,
      value: Buffer.from(JSON.stringify(user), "utf8").toString("base64url"),
      url: appUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "session",
      value: "e2e-smoke-session",
      url: appUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  return user;
}

async function installAppApiMocks(
  page: Page,
  {
    user,
    posts = [seededPost()],
    comments = [],
    rejectMutations = false,
  }: {
    user: SessionUser;
    posts?: Post[];
    comments?: Comment[];
    rejectMutations?: boolean;
  },
) {
  let postSequence = posts.length + 1;
  let commentSequence = comments.length + 1;

  await page.route("**/api/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (path === "/api/auth/session") {
      await route.fulfill(ok({ active: true, refreshed: false, user }));
      return;
    }

    if (
      path === "/api/auth/slide" ||
      path === "/api/auth/last-online" ||
      path === "/api/auth/logout"
    ) {
      await route.fulfill(ok({}));
      return;
    }

    if (path === "/api/posts" && method === "GET") {
      await route.fulfill(ok(posts));
      return;
    }

    if (path === "/api/posts" && method === "POST") {
      if (rejectMutations) {
        await route.fulfill(apiError(403, "ACCOUNT_BANNED"));
        return;
      }

      const body = request.postDataJSON() as { text?: string };
      const id = `post-e2e-created-${postSequence++}`;
      posts.unshift(
        seededPost({
          id,
          userId: user.uid,
          userName: user.name,
          text: body.text ?? "Created from E2E",
        }),
      );

      await route.fulfill(ok({ postId: id, isPending: false, isNSFW: false }));
      return;
    }

    const commentsMatch = path.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (commentsMatch && method === "GET") {
      const postId = commentsMatch[1];
      await route.fulfill(ok(comments.filter((comment) => comment.postId === postId)));
      return;
    }

    if (commentsMatch && method === "POST") {
      if (rejectMutations) {
        await route.fulfill(apiError(403, "ACCOUNT_BANNED"));
        return;
      }

      const postId = commentsMatch[1];
      const body = request.postDataJSON() as { text?: string };
      const id = `comment-e2e-created-${commentSequence++}`;
      comments.push({
        id,
        postId,
        userId: user.uid,
        userName: user.name,
        userAvatarUrl: null,
        text: body.text ?? "Comment from E2E",
        likesCount: 0,
        commentsCount: 0,
        createdAt: "2026-06-23T10:05:00.000Z",
        updatedAt: "2026-06-23T10:05:00.000Z",
        isPending: false,
        isNSFW: false,
        isEdited: false,
        imageMeta: null,
        device: "e2e",
        imageUrl: null,
        isLikedByMe: false,
      });

      const post = posts.find((item) => item.id === postId);
      if (post) post.commentsCount += 1;

      await route.fulfill(ok({ isPending: false, isNSFW: false }));
      return;
    }

    const likeMatch = path.match(/^\/api\/posts\/([^/]+)\/like$/);
    if (likeMatch && method === "POST") {
      if (rejectMutations) {
        await route.fulfill(apiError(403, "ACCOUNT_BANNED"));
        return;
      }

      const postId = likeMatch[1];
      const body = request.postDataJSON() as { liked?: boolean };
      const post = posts.find((item) => item.id === postId);
      const liked = Boolean(body.liked);

      if (post) {
        post.isLikedByMe = liked;
        post.likesCount = liked ? 1 : 0;
      }

      await route.fulfill(ok({ liked, likesCount: post?.likesCount ?? 0 }));
      return;
    }

    if (path === "/api/admin/users" && method === "GET") {
      await route.fulfill(ok([user]));
      return;
    }

    if (path === "/api/moderator/queue/posts" && method === "GET") {
      await route.fulfill(ok({ posts }));
      return;
    }

    if (path === "/api/moderator/queue/comments" && method === "GET") {
      await route.fulfill(ok({ comments: [] }));
      return;
    }

    if (path === "/api/moderator/review" && method === "POST") {
      await route.fulfill(ok({ status: "visible" }));
      return;
    }

    await route.fulfill(ok({}));
  });
}

async function openCreatePostModal(page: Page) {
  await page
    .getByRole("button", { name: /write something|napisz coś/i })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function submitComposerModal(page: Page) {
  await page.getByRole("dialog").locator("button[type='submit']").click();
}

test.describe("Batch 10 E2E smoke workflows", () => {
  test("login/session smoke renders an authenticated home session and heartbeats it", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    let sessionChecks = 0;
    await installAppApiMocks(page, { user });

    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/auth/session") {
        sessionChecks += 1;
      }
    });

    await page.goto("/");

    await expect(page.getByText(user.name)).toBeVisible();
    await expect(page.getByText(/E2E seeded post/).first()).toBeVisible();
    await expect.poll(() => sessionChecks).toBeGreaterThan(0);
  });

  test("create post smoke submits text content and refreshes the feed", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    await installAppApiMocks(page, { user, posts: [] });

    await page.goto("/");
    await openCreatePostModal(page);
    await page
      .getByPlaceholder(/what's on your mind|co u ciebie słychać/i)
      .fill("E2E created post");
    await submitComposerModal(page);

    await expect(page.getByText("E2E created post").first()).toBeVisible();
  });

  test("create comment smoke adds a comment from the post modal", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    await installAppApiMocks(page, { user });

    await page.goto("/");
    await page.getByText("E2E seeded post").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByPlaceholder(/write a comment|napisz komentarz/i)
      .fill("E2E created comment");
    await page.getByRole("dialog").locator("form button[type='submit']").click();

    await expect(page.getByText("E2E created comment")).toBeVisible();
  });

  test("like and unlike smoke preserves the latest visible target state", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    const posts = [seededPost()];
    await installAppApiMocks(page, { user, posts });

    await page.goto("/");
    const feed = page.locator("main main").first();
    await expect(feed.getByText("E2E seeded post").first()).toBeVisible();

    await feed.getByText(/^0$/).first().click();
    await expect.poll(() => posts[0].likesCount).toBe(1);
    await expect(feed.getByText(/^1$/).first()).toBeVisible();

    await feed.getByText(/^1$/).first().click();
    await expect.poll(() => posts[0].likesCount).toBe(0);
    await expect(feed.getByText(/^0$/).first()).toBeVisible();
  });

  test("image upload smoke previews a selected post image without real storage", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    await installAppApiMocks(page, { user, posts: [] });

    await page.goto("/");
    await openCreatePostModal(page);
    await page.locator("input[type='file']").setInputFiles({
      name: "e2e-pixel.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });

    await expect(page.getByRole("img", { name: /preview/i })).toBeVisible();
  });

  test("admin and moderator access smoke uses authenticated role boundaries", async ({
    page,
    context,
  }) => {
    const admin = await createLocalSessionUser(context, {
      role: "admin",
      name: "E2E Admin",
    });
    await installAppApiMocks(page, { user: admin });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(/admin/i).first()).toBeVisible();

    await context.clearCookies();
    await page.unroute("**/api/**");
    const moderator = await createLocalSessionUser(context, {
      role: "moderator",
      name: "E2E Moderator",
    });
    await installAppApiMocks(page, { user: moderator, posts: [] });

    await page.goto("/moderator");
    await expect(page).toHaveURL(/\/moderator$/);
    await expect(page.getByText(/reported posts|zgłoszone posty/i).first()).toBeVisible();
  });

  test("guest admin and moderator access smoke stays behind auth boundaries", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/moderator");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("banned user mutation smoke surfaces the server rejection", async ({
    page,
    context,
  }) => {
    const user = await createLocalSessionUser(context);
    await installAppApiMocks(page, {
      user,
      posts: [],
      rejectMutations: true,
    });

    await page.goto("/");
    await openCreatePostModal(page);
    await page
      .getByPlaceholder(/what's on your mind|co u ciebie słychać/i)
      .fill("Banned user should not post");
    await submitComposerModal(page);

    await expect(
      page.getByText(/your account has been banned|twoje konto zostało zablokowane/i),
    ).toBeVisible();
  });
});
