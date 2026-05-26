import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { userApi } from "../../../Endpoints/Api/user/userApi";
import { useLocation, useNavigate } from "react-router-dom";

interface OtpFormProps {
  otpLength?: number;
}

const OtpForm = ({ otpLength = 5 }: OtpFormProps) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Timer state added
  const [timer, setTimer] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // ✅ Timer useEffect
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== otpLength) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (timer <= 0) {
      toast.error("OTP expired. Please resend OTP.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await userApi.VerifyOtp(otpValue, email);
      toast.success(response.message);

      navigate("/user/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || "Verification failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Resend function
  const resendCode = async () => {
    try {
      await userApi.resendOtp(email); // make sure this API exists

      toast.success("New OTP sent successfully");
      setTimer(30);
      setOtp(Array(otpLength).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to resend OTP"
      );
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        We've sent a code to{" "}
        <span className="font-semibold">{email}</span>
      </p>

      <div className="flex justify-center gap-3">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-1"
          />
        ))}
      </div>

      {/* ✅ Timer UI Added */}
      <p className="text-center text-xs text-muted-foreground tracking-wide">
        {timer > 0 ? (
          <>
            Send code again {minutes}:
            {seconds.toString().padStart(2, "0")}
          </>
        ) : (
          <button
            type="button"
            onClick={resendCode}
            className="text-foreground hover:underline font-medium"
          >
            Resend Code
          </button>
        )}
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded bg-black text-white disabled:opacity-50"
      >
        Verify
      </button>
    </form>
  );
};

export default OtpForm;