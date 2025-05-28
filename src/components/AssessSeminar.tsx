import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LecturerLayout from "@/components/layouts/LecturerLayout";
import {
  FilePenLine,
  PresentationIcon,
  BrainCircuit,
  UserCog,
} from "lucide-react";
import AssessmentCriterion from "@/components/AssessmentCriterion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Seminar } from "@/configs/types";
import SeminarDetail from "@/components/SeminarDetail";
import BarChartScoreVisualization from "./BarChartScoreVisualization";
import { Loader2 } from "lucide-react"; // Impor Loader2

interface AssessSeminarProps {
  seminarType?: "PROPOSAL" | "HASIL";
}

const AssessSeminar: React.FC<AssessSeminarProps> = () => {
  const { seminarId } = useParams<{ seminarId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const seminarType = state?.seminarType || "PROPOSAL";

  const seminarQuery = useApiData({
    type: "seminarById",
    id: seminarId ? parseInt(seminarId) : undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isAdvisor, setIsAdvisor] = useState(false);
  const [scores, setScores] = useState({
    writingScore: "",
    presentationScore: "",
    masteryScore: "",
    characteristicScore: "",
  });
  const [hasAssessed, setHasAssessed] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (user !== null && user.profile?.nip) {
      setIsLoadingUser(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingUser && (!user || !token || !user.profile?.nip)) {
      navigate("/login");
    }
  }, [isLoadingUser, user, token, navigate]);

  useEffect(() => {
    setIsAdvisor(false);
    setScores({
      writingScore: "",
      presentationScore: "",
      masteryScore: "",
      characteristicScore: "",
    });
    setHasAssessed(false);
    setAssessmentData(null);
    setIsEditing(false);
    setCanUpdate(false);
    setDaysRemaining(null);

    if (seminarId) {
      seminarQuery.refetch();
    }
  }, [seminarId, seminarQuery.refetch]);

  useEffect(() => {
    if (seminarQuery.data && user?.profile?.nip) {
      const seminar: Seminar = seminarQuery.data;

      const advisorMatch = seminar.advisors.some(
        (advisor: any) => advisor.lecturer.nip === user.profile.nip
      );
      setIsAdvisor(advisorMatch);

      const existingAssessment = seminar.assessments?.find(
        (assessment) => assessment.lecturerNIP === user.profile.nip
      );
      if (existingAssessment) {
        setHasAssessed(true);
        setAssessmentData(existingAssessment);
        setScores({
          writingScore: existingAssessment.writingScore?.toString() || "",
          presentationScore: existingAssessment.presentationScore.toString(),
          masteryScore: existingAssessment.masteryScore.toString(),
          characteristicScore:
            existingAssessment.characteristicScore?.toString() || "",
        });

        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const assessmentDate = new Date(existingAssessment.createdAt);
        const timeDiff = now.getTime() - assessmentDate.getTime();
        const daysLeft = Math.max(
          0,
          Math.ceil((oneWeekInMs - timeDiff) / (24 * 60 * 60 * 1000))
        );
        setDaysRemaining(daysLeft);
        setCanUpdate(timeDiff <= oneWeekInMs);
      } else {
        setHasAssessed(false);
        setAssessmentData(null);
        setDaysRemaining(null);
      }
    }
  }, [seminarQuery.data, user?.profile?.nip]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleScoreChange = (criterion: keyof typeof scores, value: string) => {
    if (value === "") {
      setScores((prev) => ({
        ...prev,
        [criterion]: "",
      }));
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setScores((prev) => ({
        ...prev,
        [criterion]: clampedValue.toString(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredScores = [scores.presentationScore, scores.masteryScore];

    if (isAdvisor) {
      requiredScores.push(scores.characteristicScore);
    } else {
      requiredScores.push(scores.writingScore);
    }

    for (const score of requiredScores) {
      const numScore = parseFloat(score);
      if (isNaN(numScore) || numScore < 0 || numScore > 100) {
        toast.error("Setiap nilai harus antara 0 sampai 100.");
        return;
      }
    }

    setIsSubmitting(true);
    setIsLoadingSubmit(true);

    const startTime = Date.now();
    const minLoadingTime = 2000; // Ubah ke 2000ms (2 detik) untuk konsistensi

    try {
      const payload: any = {
        presentationScore: parseFloat(scores.presentationScore),
        masteryScore: parseFloat(scores.masteryScore),
      };

      if (isAdvisor) {
        payload.characteristicScore = parseFloat(scores.characteristicScore);
      } else {
        payload.writingScore = parseFloat(scores.writingScore);
      }

      const endpoint =
        seminarType === "PROPOSAL"
          ? `http://localhost:5500/api/seminars/proposal/${seminarId}/assess`
          : `http://localhost:5500/api/seminars/result/${seminarId}/assess`;

      const method = hasAssessed ? "put" : "post";
      await axios({
        method,
        url: endpoint,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      await seminarQuery.refetch();

      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;

      if (remainingTime > 0) {
        await delay(remainingTime);
      }

      setHasAssessed(true);
      setIsEditing(false);
      toast.success(
        hasAssessed
          ? "Berhasil memperbarui penilaian seminar!"
          : "Berhasil menilai seminar!"
      );
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        "Terjadi kesalahan saat menilai seminar.";
      toast.error(message);
      console.error(error);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;
      if (remainingTime > 0) {
        await delay(remainingTime);
      }
    } finally {
      setIsSubmitting(false);
      setIsLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    if (hasAssessed && assessmentData) {
      setScores({
        writingScore: assessmentData.writingScore?.toString() || "",
        presentationScore: assessmentData.presentationScore?.toString() || "",
        masteryScore: assessmentData.masteryScore?.toString() || "",
        characteristicScore:
          assessmentData.characteristicScore?.toString() || "",
      });
    } else {
      setScores({
        writingScore: "",
        presentationScore: "",
        masteryScore: "",
        characteristicScore: "",
      });
    }
    setIsEditing(false);
  };

  const weightedPresentation =
    (parseFloat(scores.presentationScore) || 0) * 0.25;
  const weightedMastery = (parseFloat(scores.masteryScore) || 0) * 0.4;
  const weightedWriting = !isAdvisor
    ? (parseFloat(scores.writingScore) || 0) * 0.35
    : 0;
  const weightedCharacteristic = isAdvisor
    ? (parseFloat(scores.characteristicScore) || 0) * 0.35
    : 0;

  const finalScore =
    weightedPresentation +
    weightedMastery +
    weightedWriting +
    weightedCharacteristic;
  const formattedFinal = finalScore.toFixed(1);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-jewel-green";
    if (score >= 80) return "text-jewel-blue";
    if (score >= 70) return "text-jewel-purple";
    if (score >= 60) return "text-jewel-yellow";
    return "text-red-600";
  };

  const getLetterGrade = (score: number) => {
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 65) return "B";
    if (score >= 60) return "B-";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "E";
  };

  const visualizationScores = {
    presentation: assessmentData?.presentationScore || 0,
    mastery: assessmentData?.masteryScore || 0,
    writing: !isAdvisor ? assessmentData?.writingScore || 0 : undefined,
    characteristic: isAdvisor
      ? assessmentData?.characteristicScore || 0
      : undefined,
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground py-10">
          Memuat data user...
        </div>
      </div>
    );
  }

  if (seminarQuery.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground py-10">
          Memuat data...
        </div>
      </div>
    );
  }

  if (seminarQuery.isError || !seminarQuery.data) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600 py-10">
          Gagal memuat data seminar atau seminar tidak ditemukan.
        </div>
      </div>
    );
  }

  const seminar: Seminar = seminarQuery.data;

  return (
    <LecturerLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Penilaian Seminar {seminarType === "PROPOSAL" ? "Proposal" : "Hasil"}
        </h1>
        <p className="text-primary md:text-base text-sm">
          Silakan beri penilaian pada seminar{" "}
          {seminarType === "PROPOSAL" ? "proposal" : "hasil"} mahasiswa di bawah
          ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SeminarDetail
          seminar={seminar}
          formatDate={formatDate}
          formatTime={formatTime}
          isAdvisor={isAdvisor}
          lecturerNIP={user!.profile.nip!}
        />

        <Card className="bg-white col-span-1 sm:col-span-2 overflow-hidden">
          <div className="relative bg-jewel-blue">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
                Kriteria Penilaian
              </CardTitle>
              <CardDescription className="text-primary-foreground text-xs md:text-sm">
                Beri nilai pada skala 0-100 untuk setiap kriteria
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className={`px-6 ${hasAssessed ? "pb-6" : "pb-0"}`}>
            {hasAssessed && !isEditing ? (
              <div className="flex flex-col">
                <BarChartScoreVisualization
                  scores={visualizationScores}
                  isAdvisor={isAdvisor}
                />
                {daysRemaining !== null && (
                  <Alert className="w-full">
                    <AlertTitle>{canUpdate ? "Info" : "Warning"}</AlertTitle>
                    <AlertDescription>
                      {canUpdate
                        ? `Anda masih bisa memperbarui nilai selama ${daysRemaining} hari lagi.`
                        : "Masa pembaruan nilai telah berakhir (lebih dari 7 hari sejak penilaian disubmit)."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <AssessmentCriterion
                  id="presentation-score"
                  icon={PresentationIcon}
                  title="Penyajian Makalah / Presentasi"
                  weight={25}
                  description="Kejelasan materi yang disampaikan, sikap, kejelasan vokal dan body language, interaksi dan komunikasi, tampilan/design materi presentasi"
                  value={scores.presentationScore}
                  onChange={(value) =>
                    handleScoreChange("presentationScore", value)
                  }
                  disabled={isSubmitting}
                />
                <AssessmentCriterion
                  id="mastery-score"
                  icon={BrainCircuit}
                  title="Penguasaan Materi"
                  weight={40}
                  description="Pemahaman materi, kemampuan menjawab pertanyaan, kedalaman pengetahuan"
                  value={scores.masteryScore}
                  onChange={(value) => handleScoreChange("masteryScore", value)}
                  disabled={isSubmitting}
                />
                {isAdvisor ? (
                  <AssessmentCriterion
                    id="characteristic-score"
                    icon={UserCog}
                    title="Karakteristik Mahasiswa"
                    weight={35}
                    description="Inisiatif, ketekunan, adaptabilitas, respons terhadap umpan balik dan bimbingan"
                    value={scores.characteristicScore}
                    onChange={(value) =>
                      handleScoreChange("characteristicScore", value)
                    }
                    disabled={isSubmitting}
                  />
                ) : (
                  <AssessmentCriterion
                    id="writing-score"
                    icon={FilePenLine}
                    title="Penulisan Makalah"
                    weight={35}
                    description="Kualitas dokumen penelitian, kejelasan ide, kutipan dan referensi yang tepat"
                    value={scores.writingScore}
                    onChange={(value) =>
                      handleScoreChange("writingScore", value)
                    }
                    disabled={isSubmitting}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white col-span-1 sm:col-span-2 overflow-hidden">
          <div className="relative bg-jewel-green">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
                Ringkasan Penilaian
              </CardTitle>
              <CardDescription className="text-primary-foreground text-xs md:text-sm">
                Hasil kalkulasi dari nilai yang diinputkan berdasarkan
                persentase
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Penyajian Makalah / Presentasi (25%)
                </span>
                <div className="font-semibold text-sm">
                  {weightedPresentation.toFixed(1)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Penguasaan Materi (40%)
                </span>
                <div className="font-semibold text-sm">
                  {weightedMastery.toFixed(1)}
                </div>
              </div>
              {isAdvisor ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Karakteristik Mahasiswa (35%)
                  </span>
                  <div className="font-semibold text-sm">
                    {weightedCharacteristic.toFixed(1)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Penulisan Makalah (35%)
                  </span>
                  <div className="font-semibold text-sm">
                    {weightedWriting.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center flex-1 justify-center mt-4">
              <p className="text-sm font-black uppercase tracking-wide mb-3">
                Total Nilai
              </p>
              <div className="flex flex-row items-center justify-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
                    <div className="text-xl font-heading font-black text-primary-800">
                      {formattedFinal}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="263.89"
                        strokeDashoffset={263.89 - (263.89 * finalScore) / 100}
                        strokeLinecap="round"
                        className={`${getScoreColor(
                          finalScore
                        )} transition-all duration-500`}
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`text-2xl font-heading font-black ${getScoreColor(
                      finalScore
                    )}`}
                  >
                    {getLetterGrade(finalScore)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            {hasAssessed && !isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full"
                disabled={!canUpdate}
              >
                {canUpdate
                  ? "Perbarui Nilai"
                  : "Batas Waktu Perbarui Telah Habis"}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  className="text-primary-foreground w-[25%]"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="w-[75%]"
                  disabled={isSubmitting || isLoadingSubmit}
                >
                  {isSubmitting || isLoadingSubmit ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Nilai"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </LecturerLayout>
  );
};

export default AssessSeminar;
