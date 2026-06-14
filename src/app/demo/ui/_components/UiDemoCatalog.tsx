"use client";

import type { ReactNode } from "react";
import {
  demoAdminUser,
  demoInputMessages,
  demoModerationPost,
  demoPost,
  demoPostNsfw,
  demoSessionUser,
  demoUserProfile,
  inputStatuses,
  reportReasons,
  reportSelectedReasonId,
  selectOptions,
  validationSamples,
} from "../_lib/demo-data";
import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import ValidationMessage from "@/features/shared/components/ui/ValidationMessage";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import { Logo } from "@/features/shared/components/ui/Logo";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { Header } from "@/features/shared/components/layout/Header";
import { LeftNav } from "@/features/shared/components/layout/LeftNav/LeftNav";
import { BottomNav } from "@/features/shared/components/layout/LeftNav/BottomNav";
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
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import cameraIconUrl from "@/features/shared/assets/icons/camera.svg?url";
import { PaperclipIcon } from "@/features/posts/icons/PaperclipIcon";
import { SendIcon } from "@/features/posts/icons/SendIcon";
import { User as UserIcon, Bell, MessageCircle } from "lucide-react";
import { DemoSection } from "./DemoSection";

function DemoRightNavStatic() {
  return (
    <div className="flex min-h-72 w-full flex-col justify-between rounded-xl border-t-2 border-surface-card-border-default bg-surface-card-background-default p-3 md:w-20 lg:w-[244px] xl:w-72">
      <section className="flex min-h-[200px] w-full flex-col items-center justify-start rounded-xl bg-white/[0.03] px-2 py-3">
        <div className="mb-3 text-[10px] font-bold tracking-wider text-foreground-secondary-default">
          ACTIVE USERS
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Avatar alt="Active user 1" width={52} height={52} />
          <Avatar alt="Active user 2" width={52} height={52} />
          <Avatar alt="Active user 3" width={52} height={52} />
        </div>
      </section>
      <div className="w-full p-4 text-center font-sans text-xs text-foreground-secondary-default/35">
        <p>© 2025-2026 Hexoo Project.</p>
        <p>Created by CHOPAPIK.</p>
      </div>
    </div>
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
      className={`relative w-full max-w-2xl rounded-2xl bg-surface-chrome-background-default/60 backdrop-blur-xl text-foreground-primary-default border border-surface-card-border-default shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-card-border-default bg-surface-chrome-background-default/60">
          <span className="text-sm font-semibold text-foreground-primary-default font-sans">
            {title}
          </span>
          <button className="text-foreground-secondary-default hover:text-foreground-primary-default transition-colors p-1">
            ✕
          </button>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-surface-card-border-default/60 bg-surface-chrome-background-default/60">
          {footer}
        </div>
      )}
    </div>
  );
}

export function UiDemoCatalog() {
  return (
      <div className="bg-page-background-default p-3 space-y-6 sm:p-6 sm:space-y-8">
        <DemoSection title="Logo & Avatar">
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
        </DemoSection>

        <DemoSection title="TextInput">
          <div className="grid gap-6 md:grid-cols-2">
            {inputStatuses.map((status) => (
              <TextInput
                key={status}
                label={`Status: ${status}`}
                placeholder="Enter text..."
                messages={demoInputMessages[status]}
              />
            ))}
            <TextInput
              label="Password (showButton: true)"
              type="password"
              placeholder="••••••••"
              showButton={true}
              messages={demoInputMessages.Default}
            />
            <TextInput
              label="Password (showButton: false)"
              type="password"
              placeholder="••••••••"
              showButton={false}
              messages={demoInputMessages.Warning}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="demo@hexoo.com"
              messages={demoInputMessages.Success}
            />
          </div>
        </DemoSection>

        <DemoSection title="Select">
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
        </DemoSection>

        <DemoSection title="ValidationMessage">
          <div className="space-y-2 max-w-md">
            {validationSamples.map((message) => (
              <ValidationMessage key={message.type} message={message} />
            ))}
          </div>
        </DemoSection>

        <DemoSection title="RemoveImageButton">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative group rounded-xl border border-surface-card-border-default p-8 bg-black/30 h-40">
              <span className="text-xs text-foreground-secondary-default">showOnHover</span>
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
            <div className="relative rounded-xl border border-surface-card-border-default p-8 bg-black/30 h-40">
              <span className="text-xs text-foreground-secondary-default">alwaysVisible</span>
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
        </DemoSection>

        <DemoSection title="NavItem">
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
        </DemoSection>

        <DemoSection title="Header & Navigation">
          <div className="space-y-6">
            <Header user={demoSessionUser} />
            <Header user={null} />
            <div className="flex gap-4 flex-wrap">
              <LeftNav user={demoSessionUser} onOpenRight={() => {}} />
              <div className="flex-1 min-w-[280px]">
                <DemoRightNavStatic />
              </div>
            </div>
            <BottomNav onOpenRight={() => {}} user={demoSessionUser} />
          </div>
        </DemoSection>

        <DemoSection title="ModalFooter">
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
        </DemoSection>

        <DemoSection title="LegalPageWrapper">
          <LegalPageWrapper>
            <h2>Example heading</h2>
            <p>
              This is example text inside LegalPageWrapper. The link at the
              bottom leads to the home page.
            </p>
          </LegalPageWrapper>
        </DemoSection>

        <DemoSection title="Auth & Security">
          <div className="grid gap-6 lg:grid-cols-2">
            <LoginForm />
            <RegisterForm />
          </div>
        </DemoSection>

        <DemoSection title="Post components">
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
            <div className="pt-4 border-t border-surface-card-border-default">
              <h3 className="text-lg font-semibold text-foreground-primary-default mb-2">
                PostList (offline)
              </h3>
              <PostList />
            </div>
          </div>
        </DemoSection>

        <DemoSection title="Profile & User components">
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
            <div className="pt-4 border-t border-surface-card-border-default">
              <h3 className="text-lg font-semibold text-foreground-primary-default mb-2">
                UserPostList (offline)
              </h3>
              <UserPostList userId="user-2" />
            </div>
          </div>
        </DemoSection>

        <DemoSection title="Settings components">
          <div className="space-y-6">
            <SettingsSection title="Settings section (demo)">
              <div className="text-sm text-foreground-secondary-default">
                Example settings section content.
              </div>
            </SettingsSection>
            <AppearanceSection />
            <ContentSection />
            <AccountSection />
            <DangerZoneSection />
            <SettingsCard />
          </div>
        </DemoSection>

        <DemoSection title="Admin & Moderator">
          <div className="space-y-6">
            <ModerationQueueItem
              post={demoModerationPost}
              onAction={() => {}}
              isPending={false}
            />
            <ModeratorDashboard />
            <AllUsersList />
          </div>
        </DemoSection>

        <DemoSection title="Modals (inline, no createPortal)">
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
                <p className="text-foreground-secondary-default text-sm">
                  Example modal content with footer actions.
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary-default">
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
              <div className="py-2 text-foreground-primary-default text-base leading-relaxed">
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
                    className="text-foreground-secondary-default hover:text-white"
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
                  <div
                    aria-label="Image preview placeholder"
                    className="h-[200px] w-[200px] rounded-xl border border-surface-card-border-default bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]"
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
                    className="w-full bg-transparent text-foreground-primary-default placeholder:text-foreground-secondary-default/50 text-base resize-none outline-none min-h-[100px] scrollbar-hide leading-relaxed pb-6"
                  />
                  <div className="absolute bottom-0 right-0 text-xs font-medium text-foreground-secondary-default/70">
                    24 / 1000
                  </div>
                </div>
              </div>
            </DemoModalShell>

            <DemoModalShell title="Post" className="max-w-5xl">
              <div className="flex gap-4">
                <div className="w-2/3 border-r border-surface-card-border-default/60 pr-4">
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
              <p className="text-sm text-foreground-secondary-default leading-relaxed">
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
                <p className="text-sm text-foreground-secondary-default">
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
                              : "bg-white/5 border-transparent hover:bg-white/10 text-foreground-secondary-default"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-fuchsia-500"
                                : "border-foreground-secondary-default"
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
                <div className="bg-surface-chrome-background-default p-3 rounded-lg text-foreground-secondary-default text-sm italic border border-surface-card-border-default">
                  Replying to: "Example post..."
                </div>
                <textarea
                  placeholder="Enter your comment..."
                  className="w-full p-3 bg-transparent border rounded-lg text-foreground-primary-default placeholder:text-foreground-secondary-default focus:outline-none resize-none h-32 transition-all border-surface-card-border-default"
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
                    <p className="text-sm text-foreground-secondary-default font-medium">
                      Click to change profile photo
                    </p>
                    <p className="text-xs text-foreground-secondary-default/60">
                      PNG, JPG lub WEBP (max 5MB)
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-chrome-background-default/30 border border-surface-card-border-default/50">
                  <TextInput
                    label="Username"
                    placeholder="Your public name"
                    value="OlaProfile"
                    onChange={() => {}}
                    showButton={false}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-foreground-secondary-default ml-1">
                      This name will be visible publicly. You can use a
                      nickname or your first name.
                    </p>
                    <p className="text-xs text-foreground-secondary-default/60 ml-1">
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
                  messages={demoInputMessages.Default}
                />
                <TextInput
                  type="password"
                  label="New password"
                  placeholder="Minimum 8 characters"
                  messages={demoInputMessages.Warning}
                />
                <TextInput
                  type="password"
                  label="Repeat new password"
                  placeholder="Confirm new password"
                  messages={demoInputMessages.Success}
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
              <p className="text-sm text-foreground-secondary-default">
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
                <p className="text-sm text-foreground-secondary-default mb-2">
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
                <div className="mb-8 p-5 rounded-xl border border-surface-card-border-default bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
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
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground-primary-default font-sans truncate">
                          {demoAdminUser.name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-surface-card-border-default text-foreground-secondary-default mb-1.5">
                          {demoAdminUser.role}
                        </span>
                      </div>
                      <p className="text-foreground-secondary-default text-sm mb-3 font-mono">
                        {demoAdminUser.email}
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-foreground-secondary-default/70 border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                          <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                            User ID
                          </span>
                          <span className="font-mono text-foreground-secondary-default select-all">
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
                    <div className="bg-white/5 p-5 rounded-xl border border-surface-card-background-default/30 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-4 text-foreground-primary-default">
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
                    <div className="bg-white/5 p-5 rounded-xl border border-surface-card-background-default/30 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-4 text-foreground-primary-default">
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
                        <p className="text-xs text-foreground-secondary-default/60">
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
                    className="text-foreground-secondary-default hover:text-white order-2 md:order-1 border-transparent"
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
        </DemoSection>
      </div>
  );
}
