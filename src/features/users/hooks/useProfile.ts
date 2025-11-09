"use client";
import { useState, useEffect } from "react";
import { User } from "../types/user.type";
import { useUsers } from "./useUsers";

export default function useProfile(username: string) {
  const { getUserByName, loading } = useUsers();
  const [userProfileData, setUserProfileData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("pobieram dane");
      const user = await getUserByName(username);
      console.log("porałem dane", user);

      if (user) {
        setUserProfileData(user);
      }
    };

    if (username) fetchUser();
  }, [username]);

  return { userProfileData, loading };
}
