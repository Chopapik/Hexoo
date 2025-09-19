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

function Root() {
  return <Layout main={<Outlet />} />;
}

const rootRoute = createRootRoute({ component: Root });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: () => <div className="p-6 text-2xl font-semibold">Messages</div>,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => (
    <div className="p-6 text-2xl font-semibold">Notifications</div>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => <div className="p-6 text-2xl font-semibold">Profile</div>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  messagesRoute,
  notificationsRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

export function App() {
  return (
    <div className="h-screen bg-page-background">
      <RouterProvider router={router} />
    </div>
  );
}
