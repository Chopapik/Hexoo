"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import authReducer from "@/features/auth/store/authSlice";
import settingsReducer from "@/features/me/store/settingsSlice";
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
import HexooBackground from "@/features/shared/components/layout/HexooBackground";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";
import { NavItem } from "@/features/shared/components/layout/LeftNav/NavItem";
import AuthBlockDisplay from "@/features/shared/components/security/AuthBlockDisplay";
import ThrottleBlockDisplay from "@/features/shared/components/security/ThrottleBlockDisplay";
import { Avatar } from "@/features/posts/components/Avatar";
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
import { Post } from "@/features/posts/types/post.entity";
import type { User } from "@/features/users/types/user.entity";
import type { UserProfileDto } from "@/features/users/types/user.dto";
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
  "gradient-fuchsia",
  "icon-fuchsia-solid",
  "icon-fuchsia-ghost",
  "glass-card",
  "danger",
  "secondary",
  "transparent",
];

const buttonSizes: ButtonSize[] = ["sm", "md", "lg", "xl", "icon", "iconSm"];

const inputStatuses: Status[] = ["Default", "Warning", "Dismiss", "Success"];

const selectOptions = [
  { value: "user", label: "Użytkownik" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
];

const validationSamples: ValidationMessageType[] = [
  { type: "Warning", text: "Uwaga: Sprawdź poprawność danych." },
  { type: "Dismiss", text: "Błąd: To pole jest wymagane." },
  { type: "Success", text: "Sukces: Wszystko wygląda dobrze." },
];

const reportReasons = [
  { id: "spam", label: "To jest spam" },
  { id: "hate", label: "Mowa nienawiści / Przemoc" },
  { id: "nudity", label: "Nagość / Treści seksualne" },
  { id: "harassment", label: "Nękanie" },
  { id: "other", label: "Inny powód" },
];
const reportSelectedReasonId = "spam";

const demoSessionUser: SessionData = {
  uid: "demo-user-1",
  email: "demo@hexoo.com",
  name: "Kasia Demo",
  role: "moderator",
  avatarUrl: undefined,
};

const demoUserProfile: UserProfileDto = {
  uid: "profile-1",
  name: "Ola Profile",
  avatarUrl: undefined,
  createdAt: new Date("2024-08-12T10:30:00Z"),
  lastOnline: new Date(),
};

const demoAdminUser: User = {
  uid: "admin-1",
  name: "Admin Hexoo",
  email: "admin@hexoo.com",
  role: "admin",
  avatarUrl: undefined,
  createdAt: new Date("2024-01-15T09:15:00Z"),
  lastOnline: new Date(),
  isBanned: false,
};

const demoPost: Post = {
  id: "post-1",
  userId: "user-2",
  userName: "Ola",
  userAvatarUrl: null,
  text: "Przykładowy post z treścią i linkiem https://hexoo.app",
  imageUrl: "https://placehold.co/600x400/png",
  likesCount: 24,
  isLikedByMe: true,
  commentsCount: 5,
  createdAt: new Date(),
  moderationStatus: "approved",
  isNSFW: false,
};

const demoPostNsfw: Post = {
  ...demoPost,
  id: "post-2",
  userId: "user-3",
  userName: "Marek",
  text: "Post oznaczony jako NSFW — domyślnie ukryty.",
  imageUrl: null,
  isNSFW: true,
  likesCount: 1,
  commentsCount: 0,
};

const demoModerationPost: Post = {
  ...demoPost,
  id: "post-3",
  moderationStatus: "pending",
  flaggedReasons: ["spam", "hate"],
  reportsMeta: [
    {
      uid: "u-001",
      reason: "spam",
      details: "Powtarzające się treści reklamowe.",
      createdAt: new Date(),
    },
    {
      uid: "u-002",
      reason: "hate",
      details: "Mowa nienawiści.",
      createdAt: new Date(),
    },
  ],
};

const demoStore = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
  },
  preloadedState: {
    auth: {
      user: demoSessionUser,
      ready: true,
    },
    settings: {
      showNSFW: true,
    },
  },
});

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
        <h2 className="text-2xl font-semibold text-text-main font-Albert_Sans">
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
          <span className="text-sm font-semibold text-text-main font-Albert_Sans">
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

export default function UiDemoPage() {
  const [rightNavOpen, setRightNavOpen] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  const inputMessages = useMemo<Record<Status, Message[]>>(
    () => ({
      Default: [],
      Warning: [{ type: "Warning", text: "To pole wymaga uwagi." }],
      Dismiss: [{ type: "Dismiss", text: "Wykryto błąd." }],
      Success: [{ type: "Success", text: "Wszystko jest OK." }],
    }),
    [],
  );

  return (
    <Provider store={demoStore}>
      <QueryClientProvider client={demoQueryClient}>
        <div className="min-h-screen bg-page-background p-6 space-y-8">
          {showBackground && <HexooBackground />}

          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-text-main font-Albert_Sans">
              UI Demo – pełny katalog komponentów (offline)
            </h1>
            <p className="text-text-neutral">
              Dane pochodzą z tego pliku. Modale są renderowane inline (bez
              createPortal).
            </p>
            <div className="flex items-center gap-3">
              <Button
                text={showBackground ? "Ukryj tło 3D" : "Pokaż tło 3D"}
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
                alt="Duży avatar"
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl"
              />
            </div>
          </Section>

          <Section title="Buttons" description="Warianty, rozmiary i stany">
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
                          size.startsWith("icon")
                            ? undefined
                            : size.toUpperCase()
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
                  placeholder="Wpisz tekst..."
                  messages={inputMessages[status]}
                />
              ))}
              <TextInput
                label="Hasło (showButton: true)"
                type="password"
                placeholder="••••••••"
                showButton={true}
                messages={inputMessages.Default}
              />
              <TextInput
                label="Hasło (showButton: false)"
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
                label="Domyślny"
                options={selectOptions}
                placeholder="Wybierz rolę"
              />
              <Select
                label="Z wybraną wartością"
                options={selectOptions}
                value="moderator"
              />
              <Select
                label="Zablokowany"
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
              <NavItem label="Aktywny" to="/demo/ui" icon={UserIcon} />
              <NavItem
                label="Powiadomienia"
                to="/notifications"
                icon={Bell}
                hasNotification
              />
              <NavItem label="Wiadomości" to="/messages" icon={MessageCircle} />
              <NavItem label="Bez ikony" to="/plain" />
            </div>
          </Section>

          <Section title="Header & Nawigacja">
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
              <BottomNav onOpenRight={() => setRightNavOpen(true)} />
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
                confirmText="Potwierdź"
                onCancel={() => {}}
                onConfirm={() => {}}
              />
              <ModalFooter
                confirmText="Usuń"
                confirmVariant="danger"
                confirmSize="sm"
                cancelSize="sm"
                onCancel={() => {}}
                onConfirm={() => {}}
              />
              <ModalFooter
                confirmText="Zapisz"
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
              <h2>Przykładowy nagłówek</h2>
              <p>
                To jest przykładowy tekst w opakowaniu LegalPageWrapper. Link na
                dole prowadzi do strony głównej.
              </p>
            </LegalPageWrapper>
          </Section>

          <Section title="Auth & Security">
            <div className="grid gap-6 lg:grid-cols-2">
              <LoginForm />
              <RegisterForm />
              <AuthBlockDisplay
                data={{
                  ipBlocked: true,
                  maxAnonymousAttempts: 5,
                  lockoutUntil: {
                    _seconds: Math.floor(Date.now() / 1000) + 1800,
                    _nanoseconds: 0,
                  },
                }}
              />
              <ThrottleBlockDisplay
                data={{
                  ip: "127.0.0.1",
                  retryAfter: Date.now() + 1000 * 60 * 60,
                  limit: 60,
                }}
              />
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
              <PostOptions postId={demoPost.id} authorId={demoPost.userId} />
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
              <SettingsSection title="Sekcja ustawień (demo)">
                <div className="text-sm text-text-neutral">
                  Przykładowa zawartość sekcji ustawień.
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

          <Section title="Modale (inline, bez createPortal)">
            <div className="space-y-8">
              <DemoModalShell
                title="Modal podstawowy"
                footer={
                  <ModalFooter
                    confirmText="Potwierdź"
                    onCancel={() => {}}
                    onConfirm={() => {}}
                  />
                }
              >
                <div className="space-y-2">
                  <p className="text-text-neutral text-sm">
                    Przykładowa treść modala wraz z akcjami w stopce.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-neutral">
                    <img
                      src={warningIconUrl}
                      alt="warning"
                      className="w-4 h-4"
                    />
                    <span>Tekst pomocniczy</span>
                  </div>
                </div>
              </DemoModalShell>

              <DemoModalShell
                title="Komunikat"
                footer={
                  <div className="flex justify-end">
                    <Button text="OK" size="sm" />
                  </div>
                }
              >
                <div className="py-2 text-text-main text-base leading-relaxed">
                  To jest przykładowy alert modal.
                </div>
              </DemoModalShell>

              <DemoModalShell
                title="Nowy post"
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
                      Przykładowy błąd
                    </span>
                    <Button
                      icon={<SendIcon className="w-5 h-5" />}
                      variant="icon-fuchsia-solid"
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
                      placeholder="Napisz coś..."
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
                title="Usunąć post?"
                footer={
                  <ModalFooter
                    confirmText="Tak, usuń"
                    onCancel={() => {}}
                    onConfirm={() => {}}
                    confirmVariant="danger"
                  />
                }
              >
                <p className="text-sm text-text-neutral leading-relaxed">
                  Czy na pewno chcesz trwale usunąć ten post? Tej operacji nie
                  będzie można cofnąć.
                </p>
              </DemoModalShell>

              <DemoModalShell
                title="Zgłoś naruszenie"
                footer={
                  <ModalFooter
                    confirmText="Zgłoś post"
                    onCancel={() => {}}
                    onConfirm={() => {}}
                  />
                }
              >
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-text-neutral">
                    Pomóż nam zrozumieć, co jest nie tak z tym postem.
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
                    label="Dodatkowe informacje (opcjonalne)"
                    placeholder="Opisz problem..."
                    value=""
                    onChange={() => {}}
                  />
                </div>
              </DemoModalShell>

              <DemoModalShell title="Skomentuj post użytkownika: Ola">
                <div className="space-y-4">
                  <div className="bg-secondary-neutral-background-default p-3 rounded-lg text-text-neutral text-sm italic border border-primary-neutral-stroke-default">
                    Odpisujesz na: "Przykładowy post..."
                  </div>
                  <textarea
                    placeholder="Wpisz swój komentarz..."
                    className="w-full p-3 bg-transparent border rounded-lg text-text-main placeholder:text-text-neutral focus:outline-none resize-none h-32 transition-all border-primary-neutral-stroke-default"
                  />
                  <div className="flex justify-end">
                    <Button text="Dodaj komentarz" size="md" />
                  </div>
                </div>
              </DemoModalShell>

              <DemoModalShell
                title="Edytuj profil — Ola Profile"
                footer={
                  <div className="flex gap-3 justify-end w-full">
                    <Button
                      text="Anuluj"
                      size="md"
                      variant="secondary"
                      type="button"
                    />
                    <Button
                      text="Zapisz"
                      size="md"
                      variant="gradient-fuchsia"
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
                              alt="Zmień"
                              width={24}
                              height={24}
                              className="opacity-90"
                            />
                            <span className="text-white text-xs font-medium">
                              Zmień
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
                        Kliknij, aby zmienić zdjęcie profilowe
                      </p>
                      <p className="text-xs text-text-neutral/60">
                        PNG, JPG lub WEBP (max 5MB)
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 p-4 rounded-xl bg-secondary-neutral-background-default/30 border border-primary-neutral-stroke-default/50">
                    <TextInput
                      label="Nazwa użytkownika"
                      placeholder="Twoja publiczna nazwa"
                      value="OlaProfile"
                      onChange={() => {}}
                      showButton={false}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-text-neutral ml-1">
                        Ta nazwa będzie widoczna publicznie — możesz użyć nicku
                        lub imienia.
                      </p>
                      <p className="text-xs text-text-neutral/60 ml-1">
                        9 / 30 znaków
                      </p>
                    </div>
                  </div>
                </div>
              </DemoModalShell>

              <DemoModalShell
                title="Zmiana hasła"
                footer={
                  <ModalFooter
                    confirmText="Zapisz zmiany"
                    onCancel={() => {}}
                    onConfirm={() => {}}
                  />
                }
              >
                <div className="flex flex-col gap-4 pt-2">
                  <TextInput
                    type="password"
                    label="Aktualne hasło"
                    placeholder="Wpisz swoje aktualne hasło"
                    messages={inputMessages.Default}
                  />
                  <TextInput
                    type="password"
                    label="Nowe hasło"
                    placeholder="Minimum 8 znaków"
                    messages={inputMessages.Warning}
                  />
                  <TextInput
                    type="password"
                    label="Powtórz nowe hasło"
                    placeholder="Potwierdź nowe hasło"
                    messages={inputMessages.Success}
                  />
                  <p className="text-sm text-red-400 mt-1">
                    Przykładowy błąd walidacji.
                  </p>
                </div>
              </DemoModalShell>

              <DemoModalShell
                title="Czy na pewno chcesz usunąć konto?"
                footer={
                  <ModalFooter
                    confirmText="Tak, usuń konto"
                    onCancel={() => {}}
                    onConfirm={() => {}}
                    confirmVariant="danger"
                  />
                }
              >
                <p className="text-sm text-text-neutral">
                  Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną
                  trwale usunięte.
                </p>
              </DemoModalShell>

              <DemoModalShell
                title="Nowy użytkownik"
                footer={
                  <ModalFooter
                    confirmText="Utwórz konto"
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
                    Utwórz konto i skonfiguruj dostęp dla nowego użytkownika.
                  </p>
                  <div className="space-y-4">
                    <TextInput
                      label="Nazwa użytkownika"
                      value="JanKowalski"
                      onChange={() => {}}
                      showButton={false}
                      placeholder="np. JanKowalski"
                    />
                    <TextInput
                      label="Email"
                      value="jan@hexoo.com"
                      onChange={() => {}}
                      showButton={false}
                      placeholder="np. jan@hexoo.com"
                    />
                    <Select
                      label="Rola"
                      value="user"
                      onChange={() => {}}
                      options={selectOptions}
                    />
                    <TextInput
                      label="Hasło"
                      type="password"
                      value="••••••••"
                      onChange={() => {}}
                      showButton={true}
                      placeholder="Wpisz hasło..."
                    />
                  </div>
                </div>
              </DemoModalShell>

              <DemoModalShell title="Edycja użytkownika" className="max-w-4xl">
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
                          Aktywny
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left w-full overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-1">
                          <h3 className="text-2xl sm:text-3xl font-bold text-text-main font-Albert_Sans truncate">
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
                              ID Użytkownika
                            </span>
                            <span className="font-mono text-text-neutral select-all">
                              {demoAdminUser.uid}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                              Dołączył
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
                          Dane profilowe
                        </h3>
                        <div className="flex flex-col gap-4 flex-1">
                          <TextInput
                            label="Nazwa wyświetlana"
                            value="Admin Hexoo"
                            placeholder={demoAdminUser.name}
                            onChange={() => {}}
                            showButton={false}
                          />
                          <Select
                            label="Rola w systemie"
                            value={demoAdminUser.role}
                            onChange={() => {}}
                            options={selectOptions}
                            placeholder="— Wybierz rolę —"
                          />
                        </div>
                        <div className="mt-6 flex justify-end">
                          <Button
                            text="Zapisz zmiany"
                            size="sm"
                            variant="gradient-fuchsia"
                            className="w-full md:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
                        <h3 className="text-lg font-medium mb-4 text-text-main">
                          Bezpieczeństwo
                        </h3>
                        <div className="flex flex-col gap-4 flex-1">
                          <TextInput
                            label="Ustaw nowe hasło"
                            value=""
                            placeholder="Min. 8 znaków"
                            onChange={() => {}}
                            type="password"
                            showButton={true}
                          />
                          <p className="text-xs text-text-neutral/60">
                            Pozostaw puste, jeśli nie chcesz zmieniać hasła.
                          </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <Button
                            text="Zmień hasło"
                            size="sm"
                            variant="gradient-fuchsia"
                            className="w-full md:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                    <Button
                      text="Anuluj i zamknij"
                      disabled={false}
                      className="text-text-neutral hover:text-white order-2 md:order-1 border-transparent"
                      variant="secondary"
                      size="sm"
                    />
                    <div className="flex gap-3 w-full md:w-auto order-1 md:order-2 justify-end">
                      <Button
                        text="Zablokuj konto"
                        size="sm"
                        variant="secondary"
                        className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                      />
                      <Button
                        text="Usuń użytkownika"
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
    </Provider>
  );
}
