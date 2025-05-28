"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowLeft,
  ArrowRight,
  Mail,
  KeyRound,
  User,
  Upload,
  Phone,
  IdCard,
  Loader2,
} from "lucide-react";
import { Stepper } from "@/components/Stepper";

// Skema validasi Zod
const emailSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .refine(
      (email) =>
        email.endsWith("@student.unri.ac.id") ||
        email.endsWith("@lecturer.unri.ac.id") ||
        email.endsWith("@eng.unri.ac.id"),
      {
        message:
          "Gunakan email kampus UR (student.unri.ac.id atau lecturer.unri.ac.id)",
      }
    ),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP harus 6 digit")
    .max(6, "OTP harus 6 digit")
    .regex(/^\d+$/, "OTP hanya boleh berisi angka"),
});

const userDataSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
    nipOrNim: z
      .string()
      .min(1, "NIP/NIM wajib diisi")
      .regex(/^\d+$/, "NIP/NIM hanya boleh berisi angka"),
    name: z.string().min(1, "Nama wajib diisi"),
    phoneNumber: z
      .string()
      .min(10, "Nomor telepon tidak valid")
      .max(13, "Nomor telepon tidak valid")
      .regex(/^08\d+$/, "Nomor telepon harus diawali dengan 08"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type FormErrors = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
  nipOrNim?: string;
  name?: string;
  phoneNumber?: string;
  profilePicture?: string;
  general?: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nipOrNim, setNipOrNim] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [role, setRole] = useState<"LECTURER" | "STUDENT" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = ["Email", "Verify", "Details"];

  // Handler untuk perubahan input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (
      value.includes("@lecturer.unri.ac.id") ||
      value.includes("@eng.unri.ac.id")
    ) {
      setRole("LECTURER");
    } else if (value.includes("@student.unri.ac.id")) {
      setRole("STUDENT");
    } else {
      setRole(null);
    }
    if (formErrors.email)
      setFormErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maks 2MB, sesuai backend)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          profilePicture: "Ukuran file maksimum adalah 2MB",
        }));
        return;
      }
      // Validasi tipe file
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

  // Countdown untuk resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
  };

  // Tahap 1: Kirim OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Mencegah pengiriman berulang

    setIsLoading(true);

    try {
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({ email: errors.email?.[0] });
        return;
      }

      const response = await fetch("http://localhost:5500/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal mengirim OTP");
        setFormErrors((prev) => ({ ...prev, general: data.message }));
        return;
      }

      toast.success(data.message || "OTP telah dikirim ke email Anda");
      setCurrentStep(2);
      startResendCountdown();
    } catch (error) {
      console.error("Terjadi kesalahan: ", error);
      toast.error("Terjadi kesalahan ketika mengirim OTP");
      setFormErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan ketika mengirim OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Verifikasi OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Mencegah pengiriman berulang

    setIsLoading(true);

    try {
      const result = otpSchema.safeParse({ otp });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({ otp: errors.otp?.[0] });
        return;
      }

      const startTime = Date.now(); // Catat waktu mulai
      const response = await fetch(
        "http://localhost:5500/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal memverifikasi OTP");
        setFormErrors((prev) => ({ ...prev, general: data.message }));
        setCurrentStep(1);
        return;
      }

      // Pastikan minimal 2 detik loading
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }

      // Setelah delay selesai, lanjutkan dengan toast dan perpindahan step
      toast.success(data.message || "OTP berhasil diverifikasi!");
      setCurrentStep(3);
    } catch (error) {
      console.error("Terjadi kesalahan: ", error);
      toast.error("Terjadi kesalahan ketika memverifikasi OTP");
      setFormErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan ketika memverifikasi OTP",
      }));
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Tahap 3: Submit registrasi
  const handleUserDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Mencegah pengiriman berulang

    setIsLoading(true);

    try {
      const result = userDataSchema.safeParse({
        password,
        confirmPassword,
        nipOrNim,
        name,
        phoneNumber,
      });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({
          password: errors.password?.[0],
          confirmPassword: errors.confirmPassword?.[0],
          nipOrNim: errors.nipOrNim?.[0],
          name: errors.name?.[0],
          phoneNumber: errors.phoneNumber?.[0],
        });
        return;
      }

      if (!otp) {
        toast.warning("Masukkan kode OTP.");
        setFormErrors((prev) => ({ ...prev, general: "Masukkan kode OTP." }));
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("nipOrNim", nipOrNim);
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const response = await fetch(
        "http://localhost:5500/api/auth/complete-register",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal mendaftar");
        setFormErrors((prev) => ({ ...prev, general: data.message }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay 2 detik
      localStorage.setItem("token", data.token);
      toast.success(data.message || "Pendaftaran berhasil!");
      navigate("/login", { state: { registrationSuccess: true } });
    } catch (error) {
      console.error("Terjadi kesalahan: ", error);
      toast.error("Terjadi kesalahan ketika mendaftar");
      setFormErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan ketika mendaftar",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Render konten berdasarkan langkah
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@[student/lecturer].unri.ac.id"
                    className="pl-9"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Gunakan email kampus (@lecturer.unri.ac.id atau
                  @student.unri.ac.id)
                </p>
              </div>
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    Lanjut
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Masukkan kode 6-digit"
                    className="pl-10"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setFormErrors((prev) => ({ ...prev, otp: undefined }));
                    }}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.otp && (
                  <p className="text-sm text-destructive">{formErrors.otp}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Kode verifikasi telah dikirim ke {email}
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="justify-start px-0 h-auto"
                  onClick={async () => {
                    if (!resendDisabled) {
                      await handleEmailSubmit(new Event("submit") as any);
                    }
                  }}
                  disabled={resendDisabled || isLoading}
                >
                  {resendDisabled
                    ? `Kirim ulang dalam ${countdown}s`
                    : "Tidak menerima kode? Kirim ulang"}
                </Button>
              </div>
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kembali
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </>
                  )}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifikasi...
                    </>
                  ) : (
                    <>
                      Lanjut
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleUserDetailsSubmit}>
            <div className="grid gap-4">
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
                      setFormErrors((prev) => ({
                        ...prev,
                        nipOrNim: undefined,
                      }));
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Buat password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Masukkan ulang password"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {formErrors.confirmPassword}
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
                      {profilePicture ? "Ganti Foto" : "Unggah Foto"}
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

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kembali
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </>
                  )}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </div>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-xl">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading font-bold text-center">
              Register
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && "Masukkan email kampus untuk mendaftar"}
              {currentStep === 2 &&
                "Masukkan kode OTP yang telah dikirim ke email Anda"}
              {currentStep === 3 && "Lengkapi data diri Anda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper steps={steps} currentStep={currentStep} className="mb-6" />
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login di sini
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
