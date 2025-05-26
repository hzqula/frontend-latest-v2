import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { z } from "zod";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/contexts/AuthContext";
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
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  BookOpen,
  KeyRound,
  Mail,
  Leaf,
  GraduationCap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Skema validasi Zod
const signInSchema = z.object({
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
          "Gunakan email kampus Universitas Riau (student.unri.ac.id atau lecturer.unri.ac.id)",
      }
    ),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormErrors = {
  email?: string;
  password?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleRecaptchaVerify = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    } else {
      toast.error("Harap Selesaikan Verifikasi ReCAPTCHA");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFormErrors({
          email: errors.email?.[0],
          password: errors.password?.[0],
        });
        setIsLoading(false);
        return;
      }

      // Cek ReCAPTCHA
      if (!recaptchaToken) {
        toast.error("Harap Selesaikan Verifikasi ReCAPTCHA");
        setIsLoading(false);
        return;
      }

      // Panggil API login
      const response = await axios.post(
        "http://localhost:5500/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      login(token, user);
      setTimeout(() => {
        toast.success("Login berhasil");
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Terjadi kesalahan: ", error);
      toast.error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.error
          : "Terjadi kesalahan saat login"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-env-light/10 to-env-base/5">
      <div className="bg-env-base text-white py-4 relative overflow-hidden">
        <div className="container mx-auto px-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <h1 className="text-base md:text-xl font-heading font-bold">
              Teknik Lingkungan
            </h1>
          </div>
          <div className="text-base md:text-lg font-bold text-env-darker ">
            Universitas Riau
          </div>
        </div>
        {/* Wave SVG untuk dekorasi background */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 60"
            className="w-full h-auto"
          >
            <path
              fill="rgb(248 250 252)"
              fillOpacity="1"
              d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,32C840,21,960,11,1080,10.7C1200,11,1320,21,1380,26.7L1440,32L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="bg-env-base p-3 rounded-sm shadow-lg">
                <BookOpen className="h-4 w-4 md:h-8 md:w-8 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold mt-2 text-env-dark">
                LATEST
              </h1>
              <p className="md:text-sm text-xs font-medium text-muted-foreground">
                Linear Environmental Engineering Thesis Administration
              </p>
            </div>
          </div>

          <Card className="border-t-4 border-t-env-base shadow-sm">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-center mb-1">
                <GraduationCap className="h-6 w-6 text-env-base mr-2" />
                <CardTitle className="text-xl font-heading font-bold">
                  Login Akun
                </CardTitle>
              </div>
              <CardDescription className="text-center text-xs md:text-sm">
                Masukkan kredensial untuk mengakses akun Anda
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit}>
                {(formErrors.email || formErrors.password) && (
                  <Alert variant="destructive" className="mb-4 text-sm">
                    <AlertDescription>
                      {formErrors.email || formErrors.password}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Kampus</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground " />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@[student/lecturer].unri.ac.id"
                        className="pl-9 placeholder:text-sm"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Kata Sandi</Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs md:text-xs text-primary hover:underline"
                      >
                        Lupa kata sandi?
                      </Link>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="pl-9 placeholder:text-sm"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center mt-2">
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={handleRecaptchaVerify}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-env-base hover:bg-env-dark text-white font-medium mt-2 h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sedang masuk...
                      </div>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-0 pb-6">
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">
                    atau
                  </span>
                </div>
              </div>

              <div className="text-center text-sm">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-env-base font-medium hover:text-env-dark hover:underline transition-colors"
                >
                  Daftar sekarang
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} S1 Teknik Lingkungan - Universitas
              Riau
            </p>
            <p className="mt-1">LATEST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
