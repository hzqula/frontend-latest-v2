"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Asumsikan Anda memiliki context untuk token

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth(); // Ambil token dan data user dari context
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimum adalah 2MB");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Hanya file gambar (JPEG, JPG, PNG) yang diperbolehkan");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () =>
        setProfilePicturePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!profilePicture) {
      toast.warning("Pilih gambar untuk diperbarui");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch(
        "http://localhost:5500/api/auth/update-profile-picture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Gagal memperbarui profil");
        return;
      }

      toast.success(data.error || "Profil berhasil diperbarui!");
      navigate("/profile"); // Redirect ke halaman profil setelah sukses
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan ketika memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Perbarui Profil
            </CardTitle>
            <CardDescription className="text-center">
              Unggah foto profil baru di sini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid gap-4">
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
                      ) : user?.profile?.profilePicture ? (
                        <img
                          src={user.profile.profilePicture}
                          alt="Current profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="profilePicture"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Unggah Foto Baru
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
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memperbarui..." : "Perbarui Profil"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateProfile;
