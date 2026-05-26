import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { setUser } from "../../../store/slices/authSlice";
import ProfileHeader from "../../../components1/user/Profile/ProfileHeader";
import ProfileInfo from "../../../components1/user/Profile/ProfileInfo";
import { Button } from "../../../components/ui/button";
import CollapsibleSection from "../../../components1/user/Profile/CollapsibleSection";
import FileUploadField from "../../../components1/user/Profile/FileUploadField";
import { userApi } from "../../../Endpoints/Api/user/userApi";
import { AxiosError } from "axios";

// ─── Cloudinary Direct Upload Helper ─────────────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: fd },
  );

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const json = await res.json();
  return json.secure_url as string;
}

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const profileSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(300, "Bio must be under 300 characters"),
  govId: z.union([z.instanceof(File), z.string()]).optional(),
  vehicleImage: z.union([z.instanceof(File), z.string()]).optional(),
  pucImage: z.union([z.instanceof(File), z.string()]).optional(),
  rcImage: z.union([z.instanceof(File), z.string()]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Existing Document Preview Component ──────────────────────────────────────
const ExistingDocument = ({ url, label }: { url?: string; label: string }) => {
  if (!url) return null;
  return (
    <div className="flex flex-col p-3 bg-accent/20 rounded-xl border border-border h-full">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {label}
      </p>
      <div className="mt-auto">
        {url.endsWith(".pdf") ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-medium hover:underline flex items-center justify-center h-24 bg-background rounded-lg border border-border">
            View PDF
          </a>
        ) : (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={label} className="w-full h-24 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
          </a>
        )}
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  });

  // Pre-fill bio when user loads
  useEffect(() => {
    if (user?.bio) {
      setValue("bio", user.bio);
    }
  }, [user, setValue]);

  // Called when the form passes validation
  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (!currentUser._id) {
        toast.error("User context lost, please login again.");
        return;
      }

      // ── Manual Validation for Files ──────────────────────────────────────────
      if (!user?.govId && !(data.govId instanceof File)) {
        toast.error("Government ID is required");
        return;
      }
      if (!user?.vehicleImage && !(data.vehicleImage instanceof File)) {
        toast.error("Vehicle image is required");
        return;
      }
      if (!user?.pucImage && !(data.pucImage instanceof File)) {
        toast.error("PUC document is required");
        return;
      }
      if (!user?.rcImage && !(data.rcImage instanceof File)) {
        toast.error("RC document is required");
        return;
      }

      // ── Step 1: Upload each file to Cloudinary in parallel ──────────────────
      toast.info("Uploading documents… please wait.");

      const [govIdUrl, vehicleImageUrl, pucImageUrl, rcImageUrl] =
        await Promise.all([
          data.govId instanceof File
            ? uploadToCloudinary(data.govId)
            : Promise.resolve(undefined),
          data.vehicleImage instanceof File
            ? uploadToCloudinary(data.vehicleImage)
            : Promise.resolve(undefined),
          data.pucImage instanceof File
            ? uploadToCloudinary(data.pucImage)
            : Promise.resolve(undefined),
          data.rcImage instanceof File
            ? uploadToCloudinary(data.rcImage)
            : Promise.resolve(undefined),
        ]);

      await userApi.UpdateProfile({
        userId: currentUser._id,
        bio: data.bio,
        ...(govIdUrl && { govId: govIdUrl }),
        ...(vehicleImageUrl && { vehicleImage: vehicleImageUrl }),
        ...(pucImageUrl && { pucImage: pucImageUrl }),
        ...(rcImageUrl && { rcImage: rcImageUrl }),
      });

      if (user) {
        dispatch(
          setUser({
            ...user,
            isRiderActive: "pending",
            bio: data.bio,
            ...(govIdUrl && { govId: govIdUrl }),
            ...(vehicleImageUrl && { vehicleImage: vehicleImageUrl }),
            ...(pucImageUrl && { pucImage: pucImageUrl }),
            ...(rcImageUrl && { rcImage: rcImageUrl }),
          }),
        );
      }

      toast.success("Profile submitted! Status is pending review.");
      navigate("/home");
    } catch (error) {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to submit profile. Please try again.",
        );
    }
  };

  // Helper to push a File into react-hook-form state
  const setFile = (field: keyof ProfileFormData, file: File | null) => {
    if (file) {
      setValue(field, file as unknown as ProfileFormData[typeof field], {
        shouldValidate: true,
      });
    }
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

        {/* Read-only Document View */}
        {!showVerification && (user?.govId || user?.vehicleImage || user?.pucImage || user?.rcImage) && (
          <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
            <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-foreground/80 border-b border-border pb-2">Submitted Documents</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {user.govId && <ExistingDocument url={user.govId} label="Gov ID" />}
              {user.vehicleImage && <ExistingDocument url={user.vehicleImage} label="Vehicle" />}
              {user.pucImage && <ExistingDocument url={user.pucImage} label="PUC" />}
              {user.rcImage && <ExistingDocument url={user.rcImage} label="RC" />}
            </div>
          </div>
        )}

        {user?.isRiderActive === "declined" && !showVerification ? (
          <div className="flex justify-center flex-col items-center gap-3 bg-red-500/10 p-4 border border-red-500/20 rounded-md">
            <span className="text-red-500 font-semibold tracking-wider uppercase text-sm">
              Verification Rejected
            </span>
            {user?.rejectionReason && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-500 text-xs px-3 py-2 rounded text-center w-full max-w-sm">
                <strong>Reason: </strong> {user.rejectionReason}
              </div>
            )}
            <span className="text-xs text-muted-foreground text-center mt-1">
              Your previous profile application has been rejected by the admin.
              Please resubmit your accurate details.
            </span>
            <Button
              type="button"
              variant="outline"
              className="tracking-widest uppercase text-xs border-red-500/50 hover:bg-red-500/20 text-red-500 mt-2"
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
                <ExistingDocument url={user?.govId} label="Government ID" />
                <FileUploadField
                  label={user?.govId ? "Upload New Government ID (optional)" : "Upload Government ID"}
                  onFileChange={(f) => setFile("govId", f)}
                  error={errors.govId?.message as string}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Confirm Email"
                subtitle={currentUser.email}
              >
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
                    <p className="text-destructive text-xs pl-1">
                      {errors.bio.message}
                    </p>
                  )}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Vehicle Details">
                <div className="space-y-3">
                  <ExistingDocument url={user?.vehicleImage} label="Vehicle Image" />
                  <FileUploadField
                    label={user?.vehicleImage ? "Upload New Vehicle Image (optional)" : "Upload Vehicle Image"}
                    onFileChange={(f) => setFile("vehicleImage", f)}
                    error={errors.vehicleImage?.message as string}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="PUC - Valid">
                <ExistingDocument url={user?.pucImage} label="PUC Document" />
                <FileUploadField
                  label={user?.pucImage ? "Upload New PUC Document (optional)" : "Upload PUC Document"}
                  onFileChange={(f) => setFile("pucImage", f)}
                  error={errors.pucImage?.message as string}
                />
              </CollapsibleSection>

              <CollapsibleSection title="RC - Valid">
                <ExistingDocument url={user?.rcImage} label="RC Document" />
                <FileUploadField
                  label={user?.rcImage ? "Upload New RC Document (optional)" : "Upload RC Document"}
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
