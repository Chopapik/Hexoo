import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="flex-1 overflow-auto flex justify-center">
        <div className="relative lg:top-[5vh] xs:top-[5vh]">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
