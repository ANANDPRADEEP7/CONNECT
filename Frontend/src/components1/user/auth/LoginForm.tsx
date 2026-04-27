import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../common/input/input";
import { loginSchema, type LoginFormData } from "../../../validator/user/login.validator";
import { toast } from "react-toastify";
import { userApi } from "../../../Endpoints/Api/user/userApi";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { setUser } from "../../../store/slices/authSlice";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await userApi.Login(data);
      dispatch(setUser(response.user));
      localStorage.setItem("token", response.token);
      toast.success(response.message || "Logged in successfully!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const result = await userApi.googleLogin(tokenResponse.access_token);
        dispatch(setUser(result.user));
        localStorage.setItem("token", result.token);
        toast.success(result.message || "Logged in with Google successfully!");
        navigate("/home");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Google login failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login was cancelled or failed.");
      setGoogleLoading(false);
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Email & Password Fields */}
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        isPassword
        {...register("password")}
        error={errors.password?.message}
      />

      {/* Forgot Password */}
      <div style={{ textAlign: "right", marginTop: "-8px" }}>
        <Link
          to="/user/forgot-password"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Logging in..." : "LOGIN"}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(var(--border))" }} />
        <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
          or continue with
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgba(var(--border))" }} />
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={() => handleGoogleLogin()}
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
        {googleLoading ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-xs text-muted-foreground tracking-wide">
        Don't have an account?{" "}
        <Link to="/" className="text-foreground hover:underline font-medium">
          SIGN UP
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
