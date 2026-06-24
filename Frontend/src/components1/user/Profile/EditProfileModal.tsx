import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, Phone, Save, Loader2, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { setUser } from "../../../store/slices/authSlice";
import { userApi } from "../../../Endpoints/Api/user/userApi";
import { AxiosError } from "axios";

// ── Schema ────────────────────────────────────────────────────────────────────
const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters"),
  email: z.string().email("Enter a valid email address"),
  phonenumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Phone must be 7-15 digits (e.g. +919876543210)")
    .or(z.literal("")),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isVisible, setIsVisible] = useState(false);

  const isGoogleUser = user?.authProvider === "google";

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phonenumber: user?.phonenumber || "",
    },
  });

  // Sync form values whenever modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: user?.name || "",
        email: user?.email || "",
        phonenumber: user?.phonenumber || "",
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      const payload: { name?: string; email?: string; phonenumber?: string } = {};
      if (data.name !== user?.name) payload.name = data.name;
      // Never send email for Google users — enforced here and on the backend
      if (!isGoogleUser && data.email !== user?.email) payload.email = data.email;
      if (data.phonenumber !== (user?.phonenumber || ""))
        payload.phonenumber = data.phonenumber || undefined;

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save.");
        onClose();
        return;
      }

      await userApi.updatePersonalInfo(payload);

      // Update Redux store immediately so UI reflects changes
      if (user) {
        dispatch(
          setUser({
            ...user,
            ...(payload.name && { name: payload.name }),
            ...(payload.email && { email: payload.email }),
            ...(payload.phonenumber !== undefined && { phonenumber: payload.phonenumber }),
          }),
        );
      }

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update profile. Please try again.",
        );
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold tracking-wide text-foreground">Edit Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Update your personal information</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Google account notice */}
          {isGoogleUser && (
            <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
              <Lock size={14} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-400 leading-relaxed">
                Your account is linked to{" "}
                <span className="font-semibold">Google</span>. Email cannot be changed.
              </p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-name"
              className="text-xs font-semibold tracking-widest uppercase text-foreground/70"
            >
              Full Name
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                id="edit-name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={`w-full bg-input border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-xs pl-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-email"
              className="text-xs font-semibold tracking-widest uppercase text-foreground/70 flex items-center gap-1.5"
            >
              Email Address
              {isGoogleUser && <Lock size={11} className="text-muted-foreground" />}
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                disabled={isGoogleUser}
                readOnly={isGoogleUser}
                title={isGoogleUser ? "Email is managed by Google and cannot be changed." : undefined}
                className={`w-full bg-input border rounded-lg pl-9 pr-4 py-2.5 text-sm transition-all ${
                  isGoogleUser
                    ? "text-muted-foreground cursor-not-allowed opacity-60 select-none border-border"
                    : errors.email
                    ? "text-foreground border-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                    : "text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring"
                }`}
              />
            </div>
            {!isGoogleUser && errors.email && (
              <p className="text-destructive text-xs pl-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-phone"
              className="text-xs font-semibold tracking-widest uppercase text-foreground/70"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                id="edit-phone"
                type="tel"
                placeholder="+91 98765 43210"
                {...register("phonenumber")}
                className={`w-full bg-input border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.phonenumber ? "border-destructive" : "border-border"
                }`}
              />
            </div>
            {errors.phonenumber && (
              <p className="text-destructive text-xs pl-1">{errors.phonenumber.message}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="save-profile-btn"
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default EditProfileModal;
