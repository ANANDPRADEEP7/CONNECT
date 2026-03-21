import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../common/input/input";
import { userApi } from "../../../Endpoints/Api/user/userApi";
import { toast } from "react-toastify";
import { signupSchema, type SignupFormData } from "../../../validator/user/signup.validator";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

const SignupForm = () => {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await userApi.Register(data);
      toast.success(response.message);
      navigate("/user/verifyOtp", { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const result = await userApi.googleLogin(tokenResponse.access_token);
        localStorage.setItem("token", result.token);
        toast.success(result.message || "Signed up with Google successfully!");
        navigate("/home");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Google sign-up failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-up was cancelled or failed.");
      setGoogleLoading(false);
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Form Fields */}
      <Input
        label="Username"
        {...register("username")}
        error={errors.username?.message}
      />
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Phone No"
        type="tel"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <Input
        label="Password"
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Creating account..." : "SIGN UP"}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(var(--border))" }} />
        <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
          or sign up with
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgba(var(--border))" }} />
      </div>

      {/* Google Sign-Up Button */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={() => handleGoogleSignup()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          width: "100%",
          padding: "12px 24px",
          background: "#ffffff",
          border: "1.5px solid #dadce0",
          borderRadius: "8px",
          cursor: googleLoading ? "not-allowed" : "pointer",
          fontSize: "15px",
          fontWeight: 500,
          color: "#3c4043",
          fontFamily: "'Google Sans', 'Roboto', Arial, sans-serif",
          transition: "background 0.2s, box-shadow 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          opacity: googleLoading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!googleLoading) (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)");
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)");
        }}
      >
        {googleLoading ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#4285F4" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {googleLoading ? "Signing up..." : "Continue with Google"}
      </button>

      {/* Login Link */}
      <p className="text-center text-xs text-muted-foreground tracking-wide">
        Already have an account?{" "}
        <Link to="/user/login" className="text-foreground hover:underline font-medium">
          LOGIN
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
