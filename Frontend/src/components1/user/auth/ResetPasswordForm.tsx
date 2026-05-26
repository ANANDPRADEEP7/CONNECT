import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../common/input/input";
import { userApi } from "../../../Endpoints/Api/user/userApi";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be under 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new link.");
      return;
    }
    try {
      const response = await userApi.resetPassword(token, data.password);
      toast.success(response.message || "Password reset successfully!");
      navigate("/user/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <h2
          className="text-lg font-semibold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reset password
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please type something you'll remember.
        </p>
      </div>

      <Input
        label="New Password"
        isPassword
        {...register("password")}
        error={errors.password?.message}
      />

      <Input
        label="Confirm Password"
        isPassword
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
