import { BsShieldLockFill } from "react-icons/bs";

export type AuthBlockData = {
  ipBlocked: boolean;
  maxAnonymousAttempts: number;
  lockoutUntil: {
    _seconds: number;
    _nanoseconds: number;
  };
};

export default function AuthBlockDisplay({ data }: { data: AuthBlockData }) {
  const lockoutTimestamp = data.lockoutUntil._seconds * 1000;

  const unlockTime = new Date(lockoutTimestamp).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="w-full flex-1 max-w-md p-10 glass-card rounded-2xl flex h-fit flex-col items-center">
      <div className="mb-6 p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
        <BsShieldLockFill className="w-6 h-6 opacity-90" />
      </div>

      <h1 className="text-xl font-Albert_Sans font-medium text-text-main text-center mb-2">
        Adres IP Zablokowany
      </h1>

      <p className="text-sm text-text-neutral text-center mb-8 font-Albert_Sans leading-relaxed">
        Wykryliśmy podejrzaną aktywność (zbyt wiele prób logowania).
        <br />
        Blokada zostanie zdjęta o godzinie:
      </p>

      <div className="px-6 py-3 bg-red-500/5 rounded-lg border border-red-500/20 mb-8">
        <span className="text-2xl font-mono font-semibold text-red-400 tracking-wider">
          {unlockTime}
        </span>
      </div>
    </div>
  );
}
