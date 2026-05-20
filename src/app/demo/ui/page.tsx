"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store/store";
import Button from "@/features/shared/components/ui/Button";
import TextInput, {
  Message,
  Status,
} from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import ValidationMessage from "@/features/shared/components/ui/ValidationMessage";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import { Logo } from "@/features/shared/components/ui/Logo";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { Header } from "@/features/shared/components/layout/Header";
import { LeftNav } from "@/features/shared/components/layout/LeftNav/LeftNav";
import { BottomNav } from "@/features/shared/components/layout/LeftNav/BottomNav";
import {
  RightNavOverlay,
  RightNavSidebar,
} from "@/features/shared/components/layout/RightNav/RightNav";
import Hexoo3D from "@/features/shared/components/layout/RightNav/Hexoo3D";
import Hexoo3Dv2 from "@/features/shared/components/layout/RightNav/Hexoo3Dv2";
import BackgroundAnimation from "@/features/shared/components/BackgroundAnimation";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";
import { NavItem } from "@/features/shared/components/layout/LeftNav/NavItem";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import CreatePostButton from "@/features/posts/components/CreatePostButton";
import { PostCard } from "@/features/posts/components/PostCard";
import { PostMeta } from "@/features/posts/components/PostMeta";
import { PostBody } from "@/features/posts/components/PostBody";
import { PostFooter } from "@/features/posts/components/PostFooter";
import PostOptions from "@/features/posts/components/PostOptions";
import PostList from "@/features/posts/components/PostList";
import LoginForm from "@/features/auth/components/LoginForm";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { UserProfileCard } from "@/features/users/components/UserProfileCard";
import { UserPostList } from "@/features/users/components/UserPostList";
import SettingsCard from "@/features/me/components/SettingsCard";
import SettingsSection from "@/features/me/components/SettingsSection";
import AccountSection from "@/features/me/components/account/AccountSection";
import DangerZoneSection from "@/features/me/components/danger/DangerZoneSection";
import AppearanceSection from "@/features/me/components/appearance/AppearanceSection";
import ContentSection from "@/features/me/components/appearance/ContentSection";
import AllUsersList from "@/features/admin/components/AllUsersList";
import ModerationQueueItem from "@/features/moderator/components/ModerationQueueItem";
import ModeratorDashboard from "@/features/moderator/components/ModeratorDashboard";
import type {
  ButtonSize,
  ButtonVariant,
} from "@/features/shared/types/button.type";
import type { ValidationMessage as ValidationMessageType } from "@/features/shared/types/validation.type";
import type { SessionData } from "@/features/me/me.type";
import type {
  PublicPostResponseDto,
  ModerationPostResponseDto,
} from "@/features/posts/types/post.dto";
import type {
  PublicUserResponseDto,
  PrivateUserResponseDto,
} from "@/features/users/types/user.dto";
import { UserRole } from "@/features/users/types/user.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import cameraIconUrl from "@/features/shared/assets/icons/camera.svg?url";
import { PaperclipIcon } from "@/features/posts/icons/PaperclipIcon";
import { SendIcon } from "@/features/posts/icons/SendIcon";
import {
  Send,
  Heart,
  Plus,
  Search,
  Settings,
  User as UserIcon,
  Bell,
  MessageCircle,
  LogOut,
  Trash2,
} from "lucide-react";

const buttonVariants: ButtonVariant[] = [
  "default",
  "glass-card",
  "danger",
  "success",
  "warning",
  "info",
  "secondary",
  "outline",
  "outline-fuchsia",
  "ghost",
  "transparent",
];

const buttonSizes: ButtonSize[] = ["sm", "md", "lg", "xl", "icon", "iconSm"];

const inputStatuses: Status[] = ["Default", "Warning", "Dismiss", "Success"];

const selectOptions = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
];

const validationSamples: ValidationMessageType[] = [
  { type: "Warning", text: "Warning: Check the data." },
  { type: "Dismiss", text: "Error: This field is required." },
  { type: "Success", text: "Success: Everything looks good." },
];

const reportReasons = [
  { id: "spam", label: "This is spam" },
  { id: "hate", label: "Hate speech / Violence" },
  { id: "nudity", label: "Nudity / Sexual content" },
  { id: "harassment", label: "Harassment" },
  { id: "other", label: "Other reason" },
];
const reportSelectedReasonId = "spam";

const demoSessionUser: SessionData = {
  uid: "demo-user-1",
  email: "demo@hexoo.com",
  name: "Kasia Demo",
  role: UserRole.Moderator,
  avatarUrl: undefined,
};

const demoUserProfile: PublicUserResponseDto = {
  uid: "profile-1",
  name: "Ola Profile",
  avatarUrl: undefined,
  createdAt: new Date("2024-08-12T10:30:00Z"),
  lastOnline: new Date(),
};

const demoAdminUser: PrivateUserResponseDto = {
  uid: "admin-1",
  name: "Admin Hexoo",
  email: "admin@hexoo.com",
  role: UserRole.Admin,
  avatarUrl: undefined,
  createdAt: new Date("2024-01-15T09:15:00Z"),
  lastOnline: new Date(),
  isActive: true,
  isBanned: false,
  bannedAt: undefined,
  bannedBy: undefined,
  bannedReason: undefined,
  isRestricted: false,
  restrictedAt: undefined,
  restrictedBy: undefined,
  restrictionReason: undefined,
  lastKnownIp: undefined,
};

const demoPost: PublicPostResponseDto = {
  id: "post-1",
  userId: "user-2",
  userName: "Ola",
  userAvatarUrl: null,
  text: "Example post with content and a link https://hexoo.app",
  imageUrl: "https://placehold.co/600x400/png",
  likesCount: 24,
  isLikedByMe: true,
  commentsCount: 5,
  createdAt: new Date(),
  isNSFW: false,
  isEdited: false,
};

const demoPostNsfw: PublicPostResponseDto = {
  ...demoPost,
  id: "post-2",
  userId: "user-3",
  userName: "Marek",
  text: "Post marked as NSFW - hidden by default.",
  imageUrl: null,
  isNSFW: true,
  likesCount: 1,
  commentsCount: 0,
};

const demoModerationPost: ModerationPostResponseDto = {
  ...demoPost,
  id: "post-3",
  moderationStatus: ModerationStatus.Pending,
  flaggedReasons: ["spam", "hate"],
  reportsMeta: [
    {
      uid: "u-001",
      reason: "spam",
      details: "Repeated advertising content.",
      createdAt: new Date(),
    },
    {
      uid: "u-002",
      reason: "hate",
      details: "Hate speech.",
      createdAt: new Date(),
    },
  ],
};

const demoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

demoQueryClient.setQueryData(["profile", "ola"], demoUserProfile);
demoQueryClient.setQueryData(["moderator", "queue"], [demoModerationPost]);
demoQueryClient.setQueryData(["admin", "allUsers"], [demoAdminUser]);
demoQueryClient.setQueryData(["posts"], {
  pages: [[demoPost, demoPostNsfw]],
  pageParams: [undefined],
});
demoQueryClient.setQueryData(["posts", "user", "user-2"], {
  pages: [[demoPost]],
  pageParams: [undefined],
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-primary-neutral-stroke-default bg-primary-neutral-background-default/40 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-main font-sans">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-neutral mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function DemoModalShell({
  title,
  footer,
  className = "",
  children,
}: {
  title?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative w-full max-w-2xl rounded-2xl bg-secondary-neutral-background-default/60 backdrop-blur-xl text-text-main border border-primary-neutral-stroke-default shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary-neutral-stroke-default bg-secondary-neutral-background-default/60">
          <span className="text-sm font-semibold text-text-main font-sans">
            {title}
          </span>
          <button className="text-text-neutral hover:text-text-main transition-colors p-1">
            ✕
          </button>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60">
          {footer}
        </div>
      )}
    </div>
  );
}

function DemoStoreBootstrap() {
  const previousState = useRef(useAppStore.getState());

  useEffect(() => {
    useAppStore.setState((state) => ({
      ...state,
      auth: {
        ...state.auth,
        user: demoSessionUser,
        ready: true,
      },
      settings: {
        language: state.settings.language,
        languageOverriddenByUser: state.settings.languageOverriddenByUser,
        showNSFWPosts: true,
        showNSFWComments: true,
        postDithering: state.settings.postDithering,
      },
    }));

    return () => {
      useAppStore.setState(previousState.current);
    };
  }, []);

  return null;
}

export default function UiDemoPage() {
  const [rightNavOpen, setRightNavOpen] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  const inputMessages = useMemo<Record<Status, Message[]>>(
    () => ({
      Default: [],
      Warning: [{ type: "Warning", text: "This field needs attention." }],
      Dismiss: [{ type: "Dismiss", text: "An error was detected." }],
      Success: [{ type: "Success", text: "Everything is OK." }],
    }),
    [],
  );

  return (
    <QueryClientProvider client={demoQueryClient}>
      <DemoStoreBootstrap />
      <div className="min-h-screen bg-page-background p-6 space-y-8">
        {showBackground && <BackgroundAnimation />}

        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-text-main font-sans">
            UI Demo - full offline component catalog
          </h1>
          <p className="text-text-neutral">
            Data comes from this file. Modals are rendered inline without
            createPortal.
          </p>
          <div className="flex items-center gap-3">
            <Button
              text={showBackground ? "Hide 3D background" : "Show 3D background"}
              size="sm"
              variant="secondary"
              onClick={() => setShowBackground((prev) => !prev)}
            />
          </div>
        </header>

        <Section title="Logo & Avatar">
          <div className="flex flex-wrap items-center gap-6">
            <Logo />
            <Avatar alt="Demo avatar" />
            <Avatar
              alt="Large avatar"
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl"
            />
          </div>
        </Section>

        <Section title="Buttons" description="Variants, sizes and states">
          <div className="space-y-10">
            {buttonVariants.map((variant) => (
              <div key={variant} className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main">
                  {variant}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {buttonSizes.map((size) => (
                    <Button
                      key={`${variant}-${size}-text`}
                      variant={variant}
                      size={size}
                      text={
                        size.startsWith("icon") ? undefined : size.toUpperCase()
                      }
                      icon={
                        size.startsWith("icon") ? (
                          <Plus className="size-4" />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant={variant}
                    size="md"
                    text="Left icon"
                    leftIcon={<Send className="size-4" />}
                  />
                  <Button
                    variant={variant}
                    size="md"
                    text="Right icon"
                    rightIcon={<Heart className="size-4" />}
                  />
                  <Button
                    variant={variant}
                    size="md"
                    text="Both"
                    leftIcon={<Search className="size-4" />}
                    rightIcon={<Settings className="size-4" />}
                  />
                  <Button
                    variant={variant}
                    size="md"
                    text="Loading"
                    isLoading
                  />
                  <Button
                    variant={variant}
                    size="md"
                    text="Disabled"
                    disabled
                  />
                  <Button
                    variant={variant}
                    size="md"
                    text="Icon URL"
                    rightIconUrl={chevronRightUrl}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="TextInput">
          <div className="grid gap-6 md:grid-cols-2">
            {inputStatuses.map((status) => (
              <TextInput
                key={status}
                label={`Status: ${status}`}
                placeholder="Enter text..."
                messages={inputMessages[status]}
              />
            ))}
            <TextInput
              label="Password (showButton: true)"
              type="password"
              placeholder="••••••••"
              showButton={true}
              messages={inputMessages.Default}
            />
            <TextInput
              label="Password (showButton: false)"
              type="password"
              placeholder="••••••••"
              showButton={false}
              messages={inputMessages.Warning}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="demo@hexoo.com"
              messages={inputMessages.Success}
            />
          </div>
        </Section>

        <Section title="Select">
          <div className="grid gap-6 md:grid-cols-2">
            <Select
              label="Default"
              options={selectOptions}
              placeholder="Choose a role"
            />
            <Select
              label="With selected value"
              options={selectOptions}
              value="moderator"
            />
            <Select
              label="Disabled"
              options={selectOptions}
              value="user"
              disabled
            />
          </div>
        </Section>

        <Section title="ValidationMessage">
          <div className="space-y-2 max-w-md">
            {validationSamples.map((message) => (
              <ValidationMessage key={message.type} message={message} />
            ))}
          </div>
        </Section>

        <Section title="RemoveImageButton">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative group rounded-xl border border-primary-neutral-stroke-default p-8 bg-black/30 h-40">
              <span className="text-xs text-text-neutral">showOnHover</span>
              <RemoveImageButton
                onClick={() => {}}
                variant="dark"
                position="top-right"
                showOnHover
              />
              <RemoveImageButton
                onClick={() => {}}
                variant="red"
                position="bottom-left"
                showOnHover
              />
            </div>
            <div className="relative rounded-xl border border-primary-neutral-stroke-default p-8 bg-black/30 h-40">
              <span className="text-xs text-text-neutral">alwaysVisible</span>
              <RemoveImageButton
                onClick={() => {}}
                variant="dark"
                position="top-left"
                alwaysVisible
              />
              <RemoveImageButton
                onClick={() => {}}
                variant="red"
                position="bottom-right"
                alwaysVisible
                iconSize={16}
              />
            </div>
          </div>
        </Section>

        <Section title="NavItem">
          <div className="flex flex-wrap items-center gap-6">
            <NavItem label="Active" to="/demo/ui" icon={UserIcon} />
            <NavItem
              label="Notifications"
              to="/notifications"
              icon={Bell}
              hasNotification
            />
            <NavItem label="Messages" to="/messages" icon={MessageCircle} />
            <NavItem label="No icon" to="/plain" />
          </div>
        </Section>

        <Section title="Header & Navigation">
          <div className="space-y-6">
            <Header user={demoSessionUser} />
            <Header user={null} />
            <div className="flex gap-4 flex-wrap">
              <LeftNav
                user={demoSessionUser}
                onOpenRight={() => setRightNavOpen(true)}
              />
              <div className="flex-1 min-w-[280px]">
                <RightNavSidebar />
              </div>
            </div>
            <BottomNav
              onOpenRight={() => setRightNavOpen(true)}
              user={demoSessionUser}
            />
            <RightNavOverlay
              open={rightNavOpen}
              onClose={() => setRightNavOpen(false)}
            />
          </div>
        </Section>

        <Section title="3D / Background">
          <div className="grid gap-6 md:grid-cols-2">
            <Hexoo3D />
            <Hexoo3Dv2 />
          </div>
        </Section>

        <Section title="ModalFooter">
          <div className="space-y-4">
            <ModalFooter
              confirmText="Confirm"
              onCancel={() => {}}
              onConfirm={() => {}}
            />
            <ModalFooter
              confirmText="Delete"
              confirmVariant="danger"
              confirmSize="sm"
              cancelSize="sm"
              onCancel={() => {}}
              onConfirm={() => {}}
            />
            <ModalFooter
              confirmText="Save"
              confirmVariant="secondary"
              confirmSize="lg"
              cancelSize="lg"
              onCancel={() => {}}
              onConfirm={() => {}}
              isPending
            />
          </div>
        </Section>

        <Section title="LegalPageWrapper">
          <LegalPageWrapper>
            <h2>Example heading</h2>
            <p>
              This is example text inside LegalPageWrapper. The link at the
              bottom leads to the home page.
            </p>
          </LegalPageWrapper>
        </Section>

        <Section title="Auth & Security">
          <div className="grid gap-6 lg:grid-cols-2">
            <LoginForm />
            <RegisterForm />
          </div>
        </Section>

        <Section title="Post components">
          <div className="space-y-6">
            <CreatePostButton onClick={() => {}} />
            <PostMeta post={demoPost} />
            <PostBody post={demoPost} />
            <PostBody
              post={{
                ...demoPost,
                id: "ascii",
                text: " /\\_/\\\\\n( o.o )\n > ^ <",
                imageUrl: null,
              }}
            />
            <PostFooter post={demoPost} onCommentClick={() => {}} />
            <PostOptions
              postId={demoPost.id}
              authorId={demoPost.userId}
              post={demoPost}
            />
            <PostCard post={demoPost} />
            <PostCard post={demoPostNsfw} />
            <PostCard post={demoPostNsfw} revealNSFW />
            <div className="pt-4 border-t border-primary-neutral-stroke-default">
              <h3 className="text-lg font-semibold text-text-main mb-2">
                PostList (offline)
              </h3>
              <PostList />
            </div>
          </div>
        </Section>

        <Section title="Profile & User components">
          <div className="space-y-6">
            <UserProfileCard
              username="ola"
              enableEditProfile={true}
              initialUser={demoUserProfile}
            />
            <UserProfileCard
              username="ola"
              enableEditProfile={false}
              initialUser={demoUserProfile}
            />
            <div className="pt-4 border-t border-primary-neutral-stroke-default">
              <h3 className="text-lg font-semibold text-text-main mb-2">
                UserPostList (offline)
              </h3>
              <UserPostList userId="user-2" />
            </div>
          </div>
        </Section>

        <Section title="Settings components">
          <div className="space-y-6">
            <SettingsSection title="Settings section (demo)">
              <div className="text-sm text-text-neutral">
                Example settings section content.
              </div>
            </SettingsSection>
            <AppearanceSection />
            <ContentSection />
            <AccountSection />
            <DangerZoneSection />
            <SettingsCard />
          </div>
        </Section>

        <Section title="Admin & Moderator">
          <div className="space-y-6">
            <ModerationQueueItem
              post={demoModerationPost}
              onAction={() => {}}
              isPending={false}
            />
            <ModeratorDashboard />
            <AllUsersList />
          </div>
        </Section>

        <Section title="Modals (inline, no createPortal)">
          <div className="space-y-8">
            <DemoModalShell
              title="Basic modal"
              footer={
                <ModalFooter
                  confirmText="Confirm"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                />
              }
            >
              <div className="space-y-2">
                <p className="text-text-neutral text-sm">
                  Example modal content with footer actions.
                </p>
                <div className="flex items-center gap-2 text-xs text-text-neutral">
                  <img src={warningIconUrl} alt="warning" className="w-4 h-4" />
                  <span>Helper text</span>
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="Message"
              footer={
                <div className="flex justify-end">
                  <Button text="OK" size="sm" />
                </div>
              }
            >
              <div className="py-2 text-text-main text-base leading-relaxed">
                This is an example alert modal.
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="New post"
              footer={
                <div className="flex items-center justify-between w-full">
                  <Button
                    icon={<PaperclipIcon className="w-5 h-5" />}
                    variant="transparent"
                    size="icon"
                    className="text-text-neutral hover:text-white"
                    type="button"
                  />
                  <span className="text-red-500 text-sm font-medium">
                    Example error
                  </span>
                  <Button
                    icon={<SendIcon className="w-5 h-5" />}
                    variant="default"
                    size="icon"
                    type="button"
                  />
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="relative w-fit group">
                  <img
                    src="https://placehold.co/200x200/png"
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-xl border border-primary-neutral-stroke-default object-cover max-h-64 w-auto"
                  />
                  <RemoveImageButton
                    onClick={() => {}}
                    variant="dark"
                    position="top-right"
                    showOnHover={true}
                  />
                </div>
                <div className="relative w-full">
                  <textarea
                    placeholder="Write something..."
                    className="w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none min-h-[100px] scrollbar-hide leading-relaxed pb-6"
                  />
                  <div className="absolute bottom-0 right-0 text-xs font-medium text-text-neutral/70">
                    24 / 1000
                  </div>
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell title="Post" className="max-w-5xl">
              <div className="flex gap-4">
                <div className="w-2/3 border-r border-primary-neutral-stroke-default/60 pr-4">
                  <PostMeta post={demoPost} />
                  <div className="pt-4">
                    <PostBody post={demoPost} />
                  </div>
                </div>
                <div className="w-1/3" />
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="Delete post?"
              footer={
                <ModalFooter
                  confirmText="Yes, delete"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                  confirmVariant="danger"
                />
              }
            >
              <p className="text-sm text-text-neutral leading-relaxed">
                Are you sure you want to permanently delete this post? This
                action cannot be undone.
              </p>
            </DemoModalShell>

            <DemoModalShell
              title="Report a violation"
              footer={
                <ModalFooter
                  confirmText="Report post"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                />
              }
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm text-text-neutral">
                  Help us understand what is wrong with this post.
                </p>
                <div className="flex flex-col gap-2">
                  {reportReasons.map((item) =>
                    (() => {
                      const isSelected = item.id === reportSelectedReasonId;
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-fuchsia-500/10 border-fuchsia-500 text-white"
                              : "bg-white/5 border-transparent hover:bg-white/10 text-text-neutral"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-fuchsia-500"
                                : "border-text-neutral"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-fuchsia-500 rounded-full" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </label>
                      );
                    })(),
                  )}
                </div>
                <TextInput
                  label="Additional information (optional)"
                  placeholder="Describe the issue..."
                  value=""
                  onChange={() => {}}
                />
              </div>
            </DemoModalShell>

            <DemoModalShell title="Comment on Ola's post">
              <div className="space-y-4">
                <div className="bg-secondary-neutral-background-default p-3 rounded-lg text-text-neutral text-sm italic border border-primary-neutral-stroke-default">
                  Replying to: "Example post..."
                </div>
                <textarea
                  placeholder="Enter your comment..."
                  className="w-full p-3 bg-transparent border rounded-lg text-text-main placeholder:text-text-neutral focus:outline-none resize-none h-32 transition-all border-primary-neutral-stroke-default"
                />
                <div className="flex justify-end">
                  <Button text="Add comment" size="md" />
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="Edit profile - Ola Profile"
              footer={
                <div className="flex gap-3 justify-end w-full">
                  <Button
                    text="Cancel"
                    size="md"
                    variant="secondary"
                    type="button"
                  />
                  <Button
                    text="Save"
                    size="md"
                    variant="default"
                    type="button"
                  />
                </div>
              }
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-xl p-px bg-[radial-gradient(circle_at_center,#262626_0%,#171717_100%)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                        <Avatar
                          src={demoUserProfile.avatarUrl || undefined}
                          alt={demoUserProfile.name}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-xl border-none"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-1">
                          <img
                            src={cameraIconUrl}
                            alt="Change"
                            width={24}
                            height={24}
                            className="opacity-90"
                          />
                          <span className="text-white text-xs font-medium">
                            Change
                          </span>
                        </div>
                      </div>
                    </div>
                    <RemoveImageButton
                      onClick={() => {}}
                      variant="dark"
                      position="top-right"
                      alwaysVisible={true}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-text-neutral font-medium">
                      Click to change profile photo
                    </p>
                    <p className="text-xs text-text-neutral/60">
                      PNG, JPG lub WEBP (max 5MB)
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-4 rounded-xl bg-secondary-neutral-background-default/30 border border-primary-neutral-stroke-default/50">
                  <TextInput
                    label="Username"
                    placeholder="Your public name"
                    value="OlaProfile"
                    onChange={() => {}}
                    showButton={false}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-text-neutral ml-1">
                      This name will be visible publicly. You can use a
                      nickname or your first name.
                    </p>
                    <p className="text-xs text-text-neutral/60 ml-1">
                      9 / 30 characters
                    </p>
                  </div>
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="Change password"
              footer={
                <ModalFooter
                  confirmText="Save changes"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                />
              }
            >
              <div className="flex flex-col gap-4 pt-2">
                <TextInput
                  type="password"
                  label="Current password"
                  placeholder="Enter your current password"
                  messages={inputMessages.Default}
                />
                <TextInput
                  type="password"
                  label="New password"
                  placeholder="Minimum 8 characters"
                  messages={inputMessages.Warning}
                />
                <TextInput
                  type="password"
                  label="Repeat new password"
                  placeholder="Confirm new password"
                  messages={inputMessages.Success}
                />
                <p className="text-sm text-red-400 mt-1">
                  Example validation error.
                </p>
              </div>
            </DemoModalShell>

            <DemoModalShell
              title="Are you sure you want to delete your account?"
              footer={
                <ModalFooter
                  confirmText="Yes, delete account"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                  confirmVariant="danger"
                />
              }
            >
              <p className="text-sm text-text-neutral">
                This operation is irreversible. All your data will be
                permanently deleted.
              </p>
            </DemoModalShell>

            <DemoModalShell
              title="New user"
              footer={
                <ModalFooter
                  confirmText="Create account"
                  onCancel={() => {}}
                  onConfirm={() => {}}
                  confirmSize="sm"
                  cancelSize="sm"
                  disabled={false}
                />
              }
            >
              <div className="flex flex-col gap-5 py-2">
                <p className="text-sm text-text-neutral mb-2">
                  Create an account and configure access for the new user.
                </p>
                <div className="space-y-4">
                  <TextInput
                    label="Username"
                    value="JanKowalski"
                    onChange={() => {}}
                    showButton={false}
                    placeholder="e.g. JanKowalski"
                  />
                  <TextInput
                    label="Email"
                    value="jan@hexoo.com"
                    onChange={() => {}}
                    showButton={false}
                    placeholder="e.g. jan@hexoo.com"
                  />
                  <Select
                    label="Role"
                    value="user"
                    onChange={() => {}}
                    options={selectOptions}
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    value="••••••••"
                    onChange={() => {}}
                    showButton={true}
                    placeholder="Enter password..."
                  />
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell title="Edit user" className="max-w-4xl">
              <div className="flex flex-col gap-6 p-1">
                <div className="mb-8 p-5 rounded-xl border border-primary-neutral-stroke-default bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative shrink-0">
                      <Avatar
                        src={demoAdminUser.avatarUrl || undefined}
                        alt={demoAdminUser.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/10 shadow-lg object-cover"
                      />
                      <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-black/20 bg-green-600 text-white">
                        Active
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-text-main font-sans truncate">
                          {demoAdminUser.name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-primary-neutral-stroke-default text-text-neutral mb-1.5">
                          {demoAdminUser.role}
                        </span>
                      </div>
                      <p className="text-text-neutral text-sm mb-3 font-mono">
                        {demoAdminUser.email}
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-text-neutral/70 border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                          <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                            User ID
                          </span>
                          <span className="font-mono text-text-neutral select-all">
                            {demoAdminUser.uid}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                            Joined
                          </span>
                          <span>15.01.2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-4 text-text-main">
                        Profile data
                      </h3>
                      <div className="flex flex-col gap-4 flex-1">
                        <TextInput
                          label="Display name"
                          value="Admin Hexoo"
                          placeholder={demoAdminUser.name}
                          onChange={() => {}}
                          showButton={false}
                        />
                        <Select
                          label="System role"
                          value={demoAdminUser.role}
                          onChange={() => {}}
                          options={selectOptions}
                          placeholder="- Choose a role -"
                        />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button
                          text="Save changes"
                          size="sm"
                          variant="default"
                          className="w-full md:w-auto"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-4 text-text-main">
                        Security
                      </h3>
                      <div className="flex flex-col gap-4 flex-1">
                        <TextInput
                          label="Set new password"
                          value=""
                          placeholder="Min. 8 characters"
                          onChange={() => {}}
                          type="password"
                          showButton={true}
                        />
                        <p className="text-xs text-text-neutral/60">
                          Leave empty if you do not want to change the password.
                        </p>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button
                          text="Change password"
                          size="sm"
                          variant="default"
                          className="w-full md:w-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <Button
                    text="Cancel and close"
                    disabled={false}
                    className="text-text-neutral hover:text-white order-2 md:order-1 border-transparent"
                    variant="secondary"
                    size="sm"
                  />
                  <div className="flex gap-3 w-full md:w-auto order-1 md:order-2 justify-end">
                    <Button
                      text="Block account"
                      size="sm"
                      variant="secondary"
                      className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                    />
                    <Button
                      text="Delete user"
                      size="sm"
                      variant="danger"
                    />
                  </div>
                </div>
              </div>
            </DemoModalShell>
          </div>
        </Section>
      </div>
    </QueryClientProvider>
  );
}
