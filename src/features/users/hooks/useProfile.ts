"use client";
import { useState, useEffect } from "react";
import { UserProfile } from "../types/user.type";

export default function useProfile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // mock data
    const mockUser: UserProfile = {
      name: "john_doe",
      joinedAt: new Date("2023-01-15T10:20:30Z"),
      lastOnline: new Date(),
      postsCount: 42,
      avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    };

    setUserData(mockUser);
    setLoading(false);
  }, []);

  return { userData, loading };
}
