"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { toast } from "react-toastify";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Stepper } from "../../components/Stepper";
import { ArrowLeft, Mail, KeyRound, EyeIcon, EyeOffIcon } from "lucide-react";


const emailSchema = z.object({
  email: z.string()
    .email("Format email tidak valid")
    .refine((email) =>
      email.endsWith("@student.unri.ac.id") ||
      email.endsWith("@lecturer.unri.ac.id"),
      {
        message: "Gunakan email kampus UR (@student.unri.ac.id atau @lecturer.unri.ac.id)",
      }
    ),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP harus 6 digit").regex(/^\d+$/, "OTP hanya angka"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmNewPassword"],
});

type FormErrors = {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"LECTURER" | "STUDENT" | null>(null);

  // Timer resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const steps = ["Email", "OTP", "New Password"];

  // Handler untuk perubahan input email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.includes("@lecturer.unri.ac.id")) {
      setRole("LECTURER");
    } else if (value.includes("@student.unri.ac.id")) {
      setRole("STUDENT");
    } else {
      setRole(null);
    }
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  // Fungsi untuk mengirim OTP
  const sendOtp = async () => {
    try {
      setIsLoading(true);
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({ email: errors.email?.[0] });
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5500/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Gagal mengirim OTP.");
        setIsLoading(false);
        return;
      }

      toast.success("OTP berhasil dikirim!");
      setCurrentStep(2);
      setCountdown(60);
    } catch (error) {
      console.error("Error saat mengirim OTP:", error);
      toast.error("Terjadi kesalahan saat mengirim OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verifikasi OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = otpSchema.safeParse({ otp });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({ otp: errors.otp?.[0] });
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5500/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "OTP tidak valid.");
        setIsLoading(false);
        return;
      }

      toast.success("OTP berhasil diverifikasi!");
      setCurrentStep(3);
    } catch (error) {
      console.error("Error saat verifikasi OTP:", error);
      toast.error("Terjadi kesalahan saat verifikasi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = passwordSchema.safeParse({ newPassword, confirmNewPassword });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({
          newPassword: errors.newPassword?.[0],
          confirmNewPassword: errors.confirmNewPassword?.[0],
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5500/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Gagal mereset password.");
        setIsLoading(false);
        return;
      }

      toast.success("Password berhasil diubah!");
      navigate("/login");
    } catch (error) {
      console.error("Error saat reset password:", error);
      toast.error("Gagal reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
            <div className="grid gap-4">
              <Label htmlFor="email">Email </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email kampus"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10"
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mengirim OTP..." : "Kirim OTP"}
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <div className="grid gap-4">
              <Label htmlFor="otp">Kode OTP</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="6 digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Kode OTP telah dikirim ke {email}
              </p>
              {formErrors.otp && (
                <p className="text-red-500 text-sm">{formErrors.otp}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={sendOtp}
                disabled={countdown > 0 || isLoading}
                className="text-primary mt-2"
              >
                {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : "Kirim Ulang OTP"}
              </Button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={resetPassword}>
            <div className="grid gap-4">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru (minimal 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.newPassword && (
                <p className="text-red-500 text-sm">{formErrors.newPassword}</p>
              )}
              <Label htmlFor="confirmNewPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.confirmNewPassword && (
                <p className="text-red-500 text-sm">{formErrors.confirmNewPassword}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Reset Password"}
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 relative">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md mt-8">
        <div className="relative mb-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Reset Password
          </h2>
        </div>
  
        <Stepper steps={steps} currentStep={currentStep} className="mb-8" />
        {renderStep()}
  
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        )}
      </div>
    </div>
  );
  
} 