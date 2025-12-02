// import Background1 from "@/components/backgrounds/Background1";
import RegisterForm from "@/features/auth/components/RegisterForm";
export default function RegisterPage() {
  return (
    <>
      {/* <Background1 /> */}
      <div className="flex-1 overflow-auto flex justify-center">
        <div className="relative lg:top-[5vh] xd:top-[15vh] xs:top-[5vh]">
          <RegisterForm />
        </div>
      </div>
    </>
  );
}
