import OAuthCompleteProfileForm from "@/features/auth/components/OAuthCompleteProfileForm";

export default function OAuthCompleteProfilePage() {
  return (
    <>
      <div className="flex-1 overflow-auto flex justify-center">
        <div className="relative lg:top-[5vh] xs:top-[5vh]">
          <OAuthCompleteProfileForm />
        </div>
      </div>
    </>
  );
}
