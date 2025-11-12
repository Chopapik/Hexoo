import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { clearUser } from "@/features/auth/store/authSlice";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed", error);
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
