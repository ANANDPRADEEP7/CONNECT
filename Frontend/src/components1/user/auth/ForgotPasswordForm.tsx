import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../../common/input/input";
import { toast } from "react-toastify";
import { userApi } from "../../../Endpoints/Api/user/userApi";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await userApi.forgotPassword(data.email);
      toast.success(response.message || "Password reset link sent to your email!");
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
          Forgot password?
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Don't worry! It happens. Please enter the email associated with your account.
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Code"}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
