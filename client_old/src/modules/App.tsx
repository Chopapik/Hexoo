import React from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";
import { UserPage } from "@/features/users/pages/UserPage/UserPage";
import { LoginPage } from "@/features/auth/login/LoginPage";

function RootWithLayout() {
  return <Layout main={<Outlet />} />;
}

function BlankRoot() {
  return <Outlet />;
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: RootWithLayout,
});

const authBlankRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: BlankRoot,
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: HomePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/messages",
  component: () => <div className="p-6 text-2xl font-semibold">Messages</div>,
});

const notificationsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/notifications",
  component: () => (
    <div className="p-6 text-2xl font-semibold">Notifications</div>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: () => <UserPage />,
});

const loginRoute = createRoute({
  getParentRoute: () => authBlankRoute,
  path: "/login",
  component: () => <LoginPage />,
});

const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    messagesRoute,
    notificationsRoute,
    profileRoute,
  ]),
  authBlankRoute.addChildren([loginRoute]),
]);

const router = createRouter({ routeTree });

export function App() {
  return (
    <div className="h-screen bg-page-background">
      <RouterProvider router={router} />
    </div>
  );
}
