import type React from "react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Phone, IdCard, Upload } from "lucide-react";

// Skema validasi Zod untuk data profil
const profileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phoneNumber: z
    .string()
    .min(10, "Nomor telepon tidak valid")
    .max(13, "Nomor telepon tidak valid")
    .regex(/^08\d+$/, "Nomor telepon harus diawali dengan 08"),
  nipOrNim: z
    .string()
    .min(1, "NIP/NIM wajib diisi")
    .regex(/^\d+$/, "NIP/NIM hanya boleh berisi angka"),
});

type FormErrors = {
  name?: string;
  phoneNumber?: string;
  nipOrNim?: string;
  profilePicture?: string;
  general?: string;
};

interface ModalEditProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalEditProfile: React.FC<ModalEditProfileProps> = ({
  open,
  onOpenChange,
}) => {
  const { user, token, userRole, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Initial values dari data pengguna
  const [name, setName] = useState(user?.profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.profile?.phoneNumber || ""
  );
  const [nipOrNim, setNipOrNim] = useState(
    user?.profile?.nim || user?.profile?.nip || ""
  );
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(user?.profile?.profilePicture || null);

  const role = userRole === "STUDENT" ? "STUDENT" : "LECTURER";

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          profilePicture: "Ukuran file maksimum adalah 2MB",
        }));
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          profilePicture:
            "Hanya file gambar (JPEG, JPG, PNG) yang diperbolehkan",
        }));
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () =>
        setProfilePicturePreview(reader.result as string);
      reader.readAsDataURL(file);
      setFormErrors((prev) => ({ ...prev, profilePicture: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    console.log("State sebelum validasi:", { name, phoneNumber, nipOrNim });

    try {
      const result = profileSchema.safeParse({
        name,
        phoneNumber,
        nipOrNim,
      });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({
          name: errors.name?.[0],
          phoneNumber: errors.phoneNumber?.[0],
          nipOrNim: errors.nipOrNim?.[0],
        });
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      if (role === "STUDENT") {
        formData.append("nim", nipOrNim);
      } else {
        formData.append("nip", nipOrNim);
      }

      const profileResponse = await fetch(
        "http://localhost:5500/api/profile/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("Server Error:", errorText);
        throw new Error(`Gagal memperbarui profil: ${errorText}`);
      }

      const profileData = await profileResponse.json();

      if (profilePicture) {
        const photoFormData = new FormData();
        photoFormData.append("profilePicture", profilePicture);

        const photoResponse = await fetch(
          "http://localhost:5500/api/profile/update-profile-picture",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: photoFormData,
          }
        );

        const photoData = await photoResponse.json();
        if (!photoResponse.ok) {
          throw new Error(photoData.error || "Gagal memperbarui foto profil");
        }

        profileData.profile.profilePicture = photoData.profilePicture;
      }

      // Pastikan id diambil dari user yang ada atau dari profileData
      const userId = user?.id || profileData.profile.id; // Ambil id dari context atau respons
      const updatedProfile = {
        id: userId, // Sertakan id
        name: profileData.profile.name,
        phoneNumber: profileData.profile.phoneNumber,
        ...(role === "STUDENT"
          ? { nim: profileData.profile.nim }
          : { nip: profileData.profile.nip }),
        profilePicture: profileData.profile.profilePicture,
      };

      // Perbarui context dengan data terbaru
      updateUser({ profile: updatedProfile });

      // Sinkronisasi state lokal dengan data terbaru
      setName(profileData.profile.name);
      setPhoneNumber(profileData.profile.phoneNumber);
      setNipOrNim(
        role === "STUDENT" ? profileData.profile.nim : profileData.profile.nip
      );
      setProfilePicturePreview(profileData.profile.profilePicture);

      toast.success("Profil berhasil diperbarui!");
      onOpenChange(false);
    } catch (error) {
      console.error("Terjadi kesalahan: ", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan ketika memperbarui profil";
      setFormErrors((prev) => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
          <DialogDescription>
            Ubah informasi profil Anda di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {formErrors.general && (
              <Alert variant="destructive">
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="pl-9"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={isLoading}
                />
              </div>
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nipOrNim">
                {role === "LECTURER" ? "NIP" : "NIM"}
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nipOrNim"
                  type="text"
                  placeholder={`Masukkan ${
                    role === "LECTURER" ? "NIP" : "NIM"
                  }`}
                  className="pl-9"
                  value={nipOrNim}
                  onChange={(e) => {
                    setNipOrNim(e.target.value);
                    setFormErrors((prev) => ({ ...prev, nipOrNim: undefined }));
                  }}
                  disabled={isLoading}
                />
              </div>
              {formErrors.nipOrNim && (
                <p className="text-sm text-destructive">
                  {formErrors.nipOrNim}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Nomor HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Masukkan nomor HP (08xx)"
                  className="pl-9"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      phoneNumber: undefined,
                    }));
                  }}
                  disabled={isLoading}
                />
              </div>
              {formErrors.phoneNumber && (
                <p className="text-sm text-destructive">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profilePicture">Foto Profil</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="profilePicture"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {profilePicturePreview ? "Ganti Foto" : "Unggah Foto"}
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleProfilePictureChange}
                      disabled={isLoading}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, maks 2MB
                  </p>
                </div>
              </div>
              {formErrors.profilePicture && (
                <p className="text-sm text-destructive">
                  {formErrors.profilePicture}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditProfile;
