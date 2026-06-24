import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Check,
  Calendar,
  Users,
  Camera,
  Loader2,
  X,
  Car,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import { vehicleApi } from "../../../Endpoints/Api/vehicle/vehicleApi";
import {
 type  Vehicle,
  type VehiclePayload,
  type VehicleType,
} from "../../../types/vehicle/vehicle.types";
import { Button } from "../../../components/ui/button";

// Cloudinary upload helpers
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: fd,
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const json = await res.json();
  return json.secure_url as string;
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [seats, setSeats] = useState(4);
  const [type, setType] = useState<VehicleType>("Car");
  const [color, setColor] = useState("");
  const [fitnessExpiry, setFitnessExpiry] = useState("");
  const [pollutionCertificate, setPollutionCertificate] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPollution, setUploadingPollution] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getMyVehicles();
      setVehicles(Array.isArray(res) ? (res as unknown as Vehicle[]) : []);
    } catch {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setName("");
    setModel("");
    setRcNumber("");
    setSeats(4);
    setType("Car");
    setColor("");
    setFitnessExpiry("");
    setPollutionCertificate("");
    setIsDefault(false);
    setImages([]);
    setModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name);
    setModel(v.model);
    setRcNumber(v.rcNumber);
    setSeats(v.seats);
    setType(v.type);
    setColor(v.color || "");
    setFitnessExpiry(new Date(v.fitnessExpiry).toISOString().split("T")[0]);
    setPollutionCertificate(v.pollutionCertificate || "");
    setIsDefault(v.isDefault);
    setImages(v.images || []);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !rcNumber || !fitnessExpiry) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (seats < 1 || seats > 8) {
      toast.error("Vehicle seating capacity must be between 1 and 8 seats");
      return;
    }

    const cleanRc = rcNumber.toUpperCase().replace(/[\s-]/g, "");
    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
    if (!standardRegex.test(cleanRc) && !bhRegex.test(cleanRc)) {
      toast.error("Invalid registration number format. Expected format like MH12AB1234 or 22BH1234A.");
      return;
    }

    const fitnessDate = new Date(fitnessExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (fitnessDate <= today) {
      toast.error("Fitness certificate has expired or is invalid. Expiry date must be in the future.");
      return;
    }

    const payload: VehiclePayload = {
      name: name.trim(),
      model: model.trim(),
      rcNumber: cleanRc,
      seats,
      type,
      color: color ? color.trim() : undefined,
      fitnessExpiry,
      pollutionCertificate: pollutionCertificate || undefined,
      isDefault,
      images,
    };

    try {
      if (editingVehicle) {
        await vehicleApi.updateVehicle(editingVehicle.id, payload);
        toast.success("Vehicle updated successfully");
      } else {
        await vehicleApi.createVehicle(payload);
        toast.success("Vehicle added successfully");
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      await vehicleApi.deleteVehicle(id);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const handleSetDefault = async (v: Vehicle) => {
    try {
      await vehicleApi.updateVehicle(v.id, { isDefault: true });
      toast.success(`${v.name} set as default vehicle`);
      fetchVehicles();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update default status",
      );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Car className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-foreground/90">
              Vehicle Management
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Add and manage your registered vehicles
            </p>
          </div>
        </div>
        <Button
          onClick={openAddModal}
          size="sm"
          className="text-[10px] tracking-wider uppercase font-black gap-1.5 rounded-xl h-9"
        >
          <Plus size={14} /> Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
          <p className="text-xs text-muted-foreground font-medium">
            No registered vehicles found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`relative border rounded-2xl p-4 transition-all duration-300 bg-secondary/10 flex flex-col justify-between ${
                v.isDefault
                  ? "border-primary/60 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {/* Default Badge */}
              {v.isDefault && (
                <span className="absolute top-3 right-3 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={10} /> Default
                </span>
              )}

              <div className="space-y-3">
                {/* Images Preview */}
                {v.images && v.images.length > 0 ? (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {v.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Vehicle"
                        className="w-16 h-12 object-cover rounded-lg border border-border/50 shrink-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-12 bg-secondary/35 rounded-lg border border-border/50 flex items-center justify-center">
                    <Car size={16} className="text-muted-foreground/40" />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-foreground">
                    {v.name}{" "}
                    <span className="text-muted-foreground font-medium">
                      ({v.model})
                    </span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
                    Reg: {v.rcNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Users size={12} />
                    <span>
                      {v.seats} Seats ({v.type})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Calendar size={12} />
                    <span>
                      Fit: {new Date(v.fitnessExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  {v.pollutionCertificate && (
                    <div className="col-span-2 flex items-center gap-1.5 text-[10px] text-primary hover:underline mt-1">
                      <FileText size={12} />
                      <a href={v.pollutionCertificate} target="_blank" rel="noreferrer">
                        View Pollution Certificate
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
                {!v.isDefault && (
                  <button
                    onClick={() => handleSetDefault(v)}
                    className="flex-1 py-1.5 bg-secondary hover:bg-secondary/80 text-[9px] font-black tracking-widest uppercase rounded-lg border border-border/50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => openEditModal(v)}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase transition-colors"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-black tracking-widest uppercase mb-6 text-foreground/90 border-b border-border/60 pb-3">
              {editingVehicle ? "Edit Vehicle Details" : "Register New Vehicle"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Toyota Innova"
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Crysta 2022"
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Registration No *
                  </label>
                  <input
                    type="text"
                    required
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="e.g. MH12AB1234"
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VehicleType)}
                    className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Total Offerable Seats *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={8}
                    value={seats}
                    onChange={(e) => setSeats(Math.min(8, Math.max(1, Number(e.target.value))))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                    Color (Optional)
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Pearl White"
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">
                  Fitness Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1.5">
                  <FileText size={12} /> Pollution Certificate
                </label>
                <div className="flex items-center gap-3">
                  {pollutionCertificate ? (
                    <div className="flex-1 flex items-center justify-between bg-secondary/30 border border-border rounded-xl px-4 py-2 text-xs">
                      <a
                        href={pollutionCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate max-w-[200px]"
                      >
                        View Certificate
                      </a>
                      <button
                        type="button"
                        onClick={() => setPollutionCertificate("")}
                        className="p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex items-center justify-center border border-dashed border-border hover:border-primary rounded-xl cursor-pointer bg-secondary/20 py-2.5 transition-colors text-xs text-muted-foreground gap-1.5 font-bold uppercase">
                      {uploadingPollution ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <>
                          <Plus size={14} />
                          Upload Pollution Certificate
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={async (e) => {
                          if (!e.target.files?.length) return;
                          setUploadingPollution(true);
                          try {
                            const url = await uploadToCloudinary(e.target.files[0]);
                            setPollutionCertificate(url);
                            toast.success("Pollution certificate uploaded successfully");
                          } catch (err: any) {
                            toast.error(err.message || "Failed to upload certificate");
                          } finally {
                            setUploadingPollution(false);
                          }
                        }}
                        disabled={uploadingPollution}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Images Manager */}
              <div className="space-y-2">
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1.5">
                  <Camera size={12} /> Vehicle Images *
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-12 rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={img}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-12 flex flex-col items-center justify-center border border-dashed border-border hover:border-primary rounded-lg cursor-pointer bg-secondary/20 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Plus size={14} className="text-muted-foreground" />
                        <span className="text-[8px] text-muted-foreground mt-0.5 font-bold uppercase">
                          Add
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Default switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="default-chk"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring"
                />
                <label
                  htmlFor="default-chk"
                  className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold cursor-pointer"
                >
                  Set as default vehicle
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-[10px] tracking-wider uppercase font-black rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-[10px] tracking-wider uppercase font-black rounded-xl"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
