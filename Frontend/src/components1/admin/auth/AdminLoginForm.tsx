import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../common/input/input";
import { loginSchema, type LoginFormData } from "../../../validator/user/login.validator";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const AdminLoginForm = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await adminApi.Login(data);
      adminLogin(response.admin);
      localStorage.setItem("adminToken", response.token);
      toast.success(response.message || "Admin logged in successfully!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-4 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "LOGGING IN..." : "LOGIN"}
      </button>
    </form>
  );
};

export default AdminLoginForm;
