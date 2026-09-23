import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Camera,
  Mail,
  Phone,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { profilesRepository } from "@/lib/db/profiles";

export const Route = createFileRoute("/_workspace/profile")({
  head: () => ({
    meta: [
      { title: "Profile · JusticeLine AI" },
      { name: "description", content: "Manage your JusticeLine profile and preferences." },
      { property: "og:title", content: "Profile · JusticeLine AI" },
      { property: "og:description", content: "Manage your profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [barCouncilInput, setBarCouncilInput] = useState("");
  const [specialisationInput, setSpecialisationInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    profile?.avatar_url ?? null
  );

  // Profile photo UI states
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropPhoto, setCropPhoto] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const firstName =
    profile?.first_name ??
    user?.user_metadata?.first_name ??
    "";

  const lastName =
    profile?.last_name ??
    user?.user_metadata?.last_name ??
    "";

  const fullName = `${firstName} ${lastName}`.trim();

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const email = user?.email ?? "";

  const phone =
    profile?.phone ??
    user?.user_metadata?.phone ??
    "";

  useEffect(() => {
    setFirstNameInput(firstName);
    setLastNameInput(lastName);
    setPhoneInput(phone);
    setSelectedPhoto(profile?.avatar_url ?? null);
  }, [firstName, lastName, phone, profile?.avatar_url]);

  const handleSaveChanges = async () => {
    if (!user?.id) return;

    setSaving(true);

    try {
      const first = firstNameInput.trim();
      const last = lastNameInput.trim();

      await profilesRepository.update(user.id, {
        first_name: first,
        last_name: last,
        phone: phoneInput.trim(),
      });

      await refreshProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFileSelected = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setCropPhoto(previewUrl);
    setCropZoom(1);
    setCropPosition({ x: 0, y: 0 });
    setCropOpen(true);
  };

  const handleCropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - cropPosition.x,
      y: event.clientY - cropPosition.y,
    });
  };

  const handleCropMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;
    setCropPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const touch = event.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - cropPosition.x,
      y: touch.clientY - cropPosition.y,
    });
  };

  const handleCropTouchMove = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;
    const touch = event.touches[0];
    setCropPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleCropTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSetProfilePhoto = async () => {
    if (!cropPhoto || !user?.id) return;

    setIsUploadingPhoto(true);

    try {
      const image = new Image();
      image.src = cropPhoto;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load image"));
      });

      const canvas = document.createElement("canvas");
      const size = 800;

      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create image canvas");
      }

      const scale =
        Math.max(
          size / image.naturalWidth,
          size / image.naturalHeight
        ) * cropZoom;

      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;

      const x =
        (size - width) / 2 + cropPosition.x * (size / 320);
      const y =
        (size - height) / 2 + cropPosition.y * (size / 320);

      context.drawImage(image, x, y, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) {
        throw new Error("Unable to create cropped image");
      }

      const croppedFile = new File([blob], "profile-photo.jpg", {
        type: "image/jpeg",
      });

      const imageUrl = await profilesRepository.uploadAvatar(
        user.id,
        croppedFile
      );

      setSelectedPhoto(imageUrl);
      await refreshProfile();

      setCropOpen(false);
      setPhotoPreviewOpen(false);

      URL.revokeObjectURL(cropPhoto);
      setCropPhoto(null);
    } catch (error) {
      console.error("Failed to set profile photo:", error);
      alert("Failed to set profile photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id || !selectedPhoto) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile photo?"
    );

    if (!confirmed) return;

    setIsDeletingPhoto(true);

    try {
      await profilesRepository.deleteAvatar(user.id);

      setSelectedPhoto(null);
      await refreshProfile();
      setPhotoPreviewOpen(false);
    } catch (error) {
      console.error("Failed to delete profile photo:", error);
      alert("Failed to delete profile photo. Please try again.");
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Profile"
        subtitle="Manage your personal details and preferences"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-elegant">
              <div className="relative mx-auto h-24 w-24">
                {/* PROFILE AVATAR BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPhoto) {
                      setPhotoPreviewOpen(true);
                    } else {
                      document
                        .getElementById("profile-photo-input")
                        ?.click();
                    }
                  }}
                  className="group grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-brand-gradient text-2xl font-semibold text-white shadow-premium transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {selectedPhoto ? (
                    <img
                      src={selectedPhoto}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "U"
                  )}
                </button>

                {/* CAMERA BADGE BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("profile-photo-input")
                      ?.click()
                  }
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-4 border-card bg-gold-gradient text-gold-foreground shadow-md transition-transform hover:scale-105"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>

                {/* FILE INPUT */}
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    handlePhotoFileSelected(file);
                    event.target.value = "";
                  }}
                />
              </div>

              <h2 className="mt-4 font-serif text-lg font-semibold">
                {fullName || "Logged In User"}
              </h2>
              <p className="text-xs text-muted-foreground">
                JusticeLine AI User
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6408]">
                  Pro Plan
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Verified
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm shadow-elegant">
              <Info icon={Mail} label="Email" value={email} />
              <Info icon={Phone} label="Phone" value={phone} />
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">
                  Personal Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update how your name and contact appear.
                </p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={firstNameInput}
                  onChange={setFirstNameInput}
                />
                <Field
                  label="Last name"
                  value={lastNameInput}
                  onChange={setLastNameInput}
                />
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  disabled
                />
                <Field
                  label="Phone"
                  value={phoneInput}
                  onChange={setPhoneInput}
                />
                <Field
                  label="Bar Council Number"
                  value={barCouncilInput}
                  onChange={setBarCouncilInput}
                />
                <Field
                  label="Specialisation"
                  value={specialisationInput}
                  onChange={setSpecialisationInput}
                />
                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="bg-brand-gradient text-white hover:opacity-95"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">
                  Change Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use a strong, unique password.
                </p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-3">
                <Field label="Current password" type="password" />
                <Field label="New password" type="password" />
                <Field label="Confirm new password" type="password" />
                <div className="sm:col-span-3 flex justify-end">
                  <Button variant="outline">Update password</Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">
                  Notifications
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  [
                    "Draft-ready emails",
                    "Get notified when a draft finishes generating.",
                  ],
                  [
                    "Weekly matter digest",
                    "Summary of your activity every Monday.",
                  ],
                  [
                    "New judgment alerts",
                    "SC / HC judgments relevant to your matters.",
                  ],
                  ["Product updates", "Occasional emails about new features."],
                ].map(([t, d], i) => (
                  <div
                    key={t}
                    className="flex items-center justify-between p-5"
                  >
                    <div>
                      <p className="text-sm font-medium">{t}</p>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                    <Switch defaultChecked={i < 3} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* PHOTO PREVIEW & DELETE MODAL */}
      {photoPreviewOpen && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setPhotoPreviewOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-semibold">Profile Photo</h3>

            <div className="my-6 flex justify-center">
              <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-muted shadow-inner">
                <img
                  src={selectedPhoto}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  document
                    .getElementById("profile-photo-input")
                    ?.click()
                }
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={isDeletingPhoto}
                onClick={handleDeletePhoto}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeletingPhoto ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* INSTAGRAM-STYLE CROP & ZOOM SETUP MODAL */}
      {cropOpen && cropPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-lg font-semibold">Adjust Profile Photo</h3>
              <button
                type="button"
                onClick={() => setCropOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CIRCULAR VIEWPORT */}
            <div
              className="relative mx-auto h-64 w-64 cursor-grab overflow-hidden rounded-full border-2 border-primary/50 bg-black/80 active:cursor-grabbing"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={handleCropTouchEnd}
            >
              <img
                src={cropPhoto}
                alt="Crop View"
                draggable={false}
                className="absolute max-w-none select-none transition-transform duration-75"
                style={{
                  transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropZoom})`,
                  top: "50%",
                  left: "50%",
                  marginTop: "-128px",
                  marginLeft: "-128px",
                  width: "256px",
                  height: "256px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* ZOOM SLIDER CONTROLS */}
            <div className="mt-6 flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCropOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-brand-gradient text-white"
                disabled={isUploadingPhoto}
                onClick={handleSetProfilePhoto}
              >
                {isUploadingPhoto ? "Saving..." : "Save Photo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  type = "text",
  defaultValue,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/5 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}