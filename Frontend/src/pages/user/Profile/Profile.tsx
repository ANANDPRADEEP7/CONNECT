import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import ProfileHeader from "../../../components1/user/Profile/ProfileHeader";
import ProfileInfo from "../../../components1/user/Profile/ProfileInfo";
import { Button } from "../../../components/ui/button";
import CollapsibleSection from "../../../components1/user/Profile/CollapsibleSection";
import FileUploadField from "../../../components1/user/Profile/FileUploadField";
import { userApi } from "../../../Endpoints/Api/user/userApi";

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const profileSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(300, "Bio must be under 300 characters"),
  govId: z.any().refine((f) => f instanceof File, "Government ID is required"),
  vehicleImage: z.any().refine((f) => f instanceof File, "Vehicle image is required"),
  pucImage: z.any().refine((f) => f instanceof File, "PUC document is required"),
  rcImage: z.any().refine((f) => f instanceof File, "RC document is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;



// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    _id: "",
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    dob: "Not Provided",
    avatarUrl: "",
    verified: true,
  });

  const user = useAppSelector((state) => state.auth.user);
  
  useEffect(() => {
    if (!user) {
      toast.error("Please login to view your profile");
      navigate("/"); // Redirect to login if not available
      return;
    }

    const nameParts = user.name.split(" ");
    setCurrentUser({
      _id: user.id,
      name: user.name,
      email: user.email,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      dob: "Not Provided",
      avatarUrl: "",
      verified: true,
    });

    if (user.isRiderActive === "declined") {
      toast.error("Your rider verification was rejected by admin.");
    }

  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { bio: "" },
  });

  // Called when the form passes validation
  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Build FormData to send files + text fields together
      const formData = new FormData();

      // Enforce that we successfully decoded a userId
      if (!currentUser._id) {
        toast.error("User context lost, please login again.");
        return;
      }

      formData.append("userId", currentUser._id);
      formData.append("bio", data.bio);

      // Only append files that were actually selected
      if (data.govId instanceof File) formData.append("govId", data.govId);
      if (data.vehicleImage instanceof File) formData.append("vehicleImage", data.vehicleImage);
      if (data.pucImage instanceof File) formData.append("pucImage", data.pucImage);
      if (data.rcImage instanceof File) formData.append("rcImage", data.rcImage);

      // POST multipart/form-data → /user/profile
      await userApi.UpdateProfile(formData);

      toast.success("Profile submitted! Status is pending review.");
      navigate("/home");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit profile. Please try again.");
    }
  };

  // Helper to push a File into react-hook-form state
  const setFile = (field: keyof ProfileFormData, file: File | null) => {
    setValue(field, file as any, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-xl space-y-4">

        {/* Profile Header */}
        <ProfileHeader
          name={currentUser.name}
          avatarUrl={currentUser.avatarUrl}
          verified={currentUser.verified}
        />

        {/* Basic Info */}
        <ProfileInfo
          fields={[
            { label: "First Name", value: currentUser.firstName },
            { label: "Last Name", value: currentUser.lastName },
            { label: "Date of Birth", value: currentUser.dob },
          ]}
        />

        {/* Show button to expand verification form, or show the form itself */}
        {user?.isRiderActive === "declined" ? (
          <div className="flex justify-center flex-col items-center gap-3 bg-red-500/10 p-4 border border-red-500/20 rounded-md">
            <span className="text-red-500 font-semibold tracking-wider uppercase text-sm">
              Verification Rejected
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Your previous profile application has been rejected by the admin. Please resubmit your accurate details.
            </span>
            <Button
              type="button"
              variant="outline"
              className="tracking-widest uppercase text-xs border-red-500/50 hover:bg-red-500/20 text-red-500"
              onClick={() => setShowVerification(true)}
            >
              Re-submit Verification Details
            </Button>
          </div>
        ) : !showVerification ? (
          <div className="flex justify-center flex-col items-center gap-3">
             {user?.isRiderActive === "pending" && (
                <span className="text-yellow-500 font-semibold tracking-wider uppercase text-xs mb-2">
                  Status: Pending Admin Approval
                </span>
             )}
            <Button
              type="button"
              variant="outline"
              className="tracking-widest uppercase text-xs border-border hover:border-ring"
              onClick={() => setShowVerification(true)}
            >
              Complete Verification &amp; Details
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Section 1: Gov ID & Email ── */}
            <div className="bg-card border border-border rounded-xl px-5 py-2 divide-y divide-border">
              <CollapsibleSection title="Verify Your Gov.ID">
                <FileUploadField
                  label="Upload Government ID"
                  onFileChange={(f) => setFile("govId", f)}
                  error={errors.govId?.message as string}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Confirm Email" subtitle={currentUser.email}>
                <p className="text-xs text-muted-foreground">
                  A confirmation link will be sent to{" "}
                  <span className="text-foreground">{currentUser.email}</span>
                </p>
              </CollapsibleSection>
            </div>

            {/* ── Section 2: Bio & Vehicle Documents ── */}
            <div className="bg-card border border-border rounded-xl px-5 py-2 divide-y divide-border">
              <CollapsibleSection title="Add a Mini Bio">
                <div className="space-y-1">
                  <textarea
                    {...register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full bg-input border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
                  />
                  {errors.bio && (
                    <p className="text-destructive text-xs pl-1">{errors.bio.message}</p>
                  )}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Vehicle Details">
                <div className="space-y-3">
                  <FileUploadField
                    label="Upload Vehicle Image"
                    onFileChange={(f) => setFile("vehicleImage", f)}
                    error={errors.vehicleImage?.message as string}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="PUC - Valid">
                <FileUploadField
                  label="Upload PUC Document"
                  onFileChange={(f) => setFile("pucImage", f)}
                  error={errors.pucImage?.message as string}
                />
              </CollapsibleSection>

              <CollapsibleSection title="RC - Valid">
                <FileUploadField
                  label="Upload RC Document"
                  onFileChange={(f) => setFile("rcImage", f)}
                  error={errors.rcImage?.message as string}
                />
              </CollapsibleSection>
            </div>

            {/* ── Submit Button ── */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full tracking-widest uppercase text-xs py-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Profile"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
