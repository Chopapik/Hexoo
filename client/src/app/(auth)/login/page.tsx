import Background1 from "@/components/backgrounds/Background1";
import LoginForm from "@/features/auth/login/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Background1 />
      <div className="w-full h-full overflow-auto flex justify-center">
        <div className="relative lg:top-[15vh] xs:top-[5vh] w-full max-w-[653px]">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
