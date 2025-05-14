import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Seminar } from "@/configs/types";
import SeminarDetail from "@/components/SeminarDetail";

interface ScoreVisualizationProps {
  scores: {
    presentation: number;
    mastery: number;
    writing?: number;
    characteristic?: number;
  };
  isAdvisor: boolean;
}

const ScoreVisualization: React.FC<ScoreVisualizationProps> = ({
  scores,
  isAdvisor,
}) => {
  const data = [
    {
      name: "Penyajian Makalah / Presentasi",
      score: scores.presentation,
      description:
        "Kejelasan materi yang disampaikan, sikap, kejelasan vokal dan body language, interaksi dan komunikasi, tampilan/design materi presentasi",
    },
    {
      name: "Penguasaan Materi",
      score: scores.mastery,
      description:
        "Pemahaman materi, kemampuan menjawab pertanyaan, kedalaman pengetahuan",
    },
  ];

  if (isAdvisor) {
    data.push({
      name: "Karakteristik Mahasiswa",
      score: scores.characteristic || 0,
      description:
        "Inisiatif, ketekunan, adaptabilitas, respons terhadap umpan balik dan bimbingan",
    });
  } else {
    data.push({
      name: "Penulisan Makalah",
      score: scores.writing || 0,
      description:
        "Kualitas dokumen penelitian, kejelasan ide, kutipan dan referensi yang tepat",
    });
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#2563eb";
    if (score >= 70) return "#f59e0b";
    return "#dc2626";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="bg-white border border-gray-200 rounded-lg shadow-md p-3"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">Nilai: {data.score}/100</p>
          {data.description && (
            <p className="text-xs text-gray-500 mt-1">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 14, fill: "#334155" }}
              width={150}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              radius={[0, 8, 8, 0]}
              barSize={20}
              fill="#10b981"
            >
              {data.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="score"
                  fill={getScoreColor(entry.score)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AssessSeminarProposal = () => {
  const { seminarId } = useParams<{ seminarId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

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

  // Fungsi untuk menunda eksekusi menggunakan Promise
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Cek apakah user dan nip sudah dimuat
  useEffect(() => {
    if (user !== null && user.profile?.nip) {
      setIsLoadingUser(false);
    }
  }, [user]);

  // Navigasi ke login jika user tidak valid
  useEffect(() => {
    if (!isLoadingUser && (!user || !token || !user.profile?.nip)) {
      navigate("/login");
    }
  }, [isLoadingUser, user, token, navigate]);

  // Reset state saat seminarId berubah
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

  // Update state berdasarkan data seminar yang baru
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

  const calculateAverage = () => {
    const {
      presentationScore,
      masteryScore,
      writingScore,
      characteristicScore,
    } = scores;
    const presentation = parseFloat(presentationScore) || 0;
    const mastery = parseFloat(masteryScore) || 0;
    let weightedAverage;

    if (isAdvisor) {
      const characteristic = parseFloat(characteristicScore) || 0;
      weightedAverage =
        presentation * 0.25 + mastery * 0.4 + characteristic * 0.35;
    } else {
      const writing = parseFloat(writingScore) || 0;
      weightedAverage = presentation * 0.25 + mastery * 0.4 + writing * 0.35;
    }

    return weightedAverage.toFixed(1);
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
    const minLoadingTime = 1500;

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

      const method = hasAssessed ? "put" : "post";
      await axios({
        method,
        url: `http://localhost:5500/api/seminars/proposal/${seminarId}/assess`,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      await seminarQuery.refetch(); // Refetch data setelah API selesai

      // Hitung waktu yang sudah berlalu
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;

      // Jika waktu yang sudah berlalu kurang dari 2 detik, tunggu sisa waktu
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

      // Pastikan animasi loading tetap muncul setidaknya 2 detik meskipun ada error
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
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const scoreColor = getScoreColor(finalScore);

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
      <h1 className="text-4xl font-heading font-black mb-3 text-primary-800">
        Penilaian Seminar Proposal
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SeminarDetail
          seminar={seminar}
          formatDate={formatDate}
          formatTime={formatTime}
          isAdvisor={isAdvisor}
          lecturerNIP={user!.profile.nip!}
        />

        <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-2 overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

            <CardHeader className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-heading font-black text-primary-foreground">
                    Kriteria Penilaian
                  </CardTitle>
                  <CardDescription className="text-sm text-primary-foreground">
                    Beri nilai pada skala 0-100 untuk setiap kriteria
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6">
            {hasAssessed && !isEditing ? (
              <div className="flex flex-col gap-6 py-6 min-h-[400px]">
                <ScoreVisualization
                  scores={visualizationScores}
                  isAdvisor={isAdvisor}
                />
                {daysRemaining !== null && (
                  <>
                    <Alert className="w-full">
                      <AlertTitle>{canUpdate ? "Info" : "Warning"}</AlertTitle>
                      <AlertDescription>
                        {canUpdate
                          ? `Anda masih bisa memperbarui nilai selama ${daysRemaining} hari lagi.`
                          : "Masa pembaruan nilai telah berakhir (lebih dari 7 hari sejak penilaian disubmit)."}
                      </AlertDescription>
                    </Alert>
                  </>
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
        <Card className="bg-white col-span-1 flex flex-col sm:col-span-2 lg:col-span-2 overflow-hidden">
          <div className="relative bg-gradient-to-r from-emerald-600 to-primary">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

            <CardHeader className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-heading font-black text-primary-foreground">
                    Ringkasan Penilaian
                  </CardTitle>
                  <CardDescription className="text-sm text-primary-foreground">
                    Hasil kalkulasi dari nilai yang diinputkan berdasarkan
                    persentase
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-semibold text-lg">
                  Penyajian Makalah / Presentasi (25%)
                </span>
                <div className="font-semibold text-lg">
                  {weightedPresentation.toFixed(1)}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-semibold text-lg">
                  Penguasaan Materi (40%)
                </span>
                <div className="font-semibold text-lg">
                  {weightedMastery.toFixed(1)}
                </div>
              </div>
              {isAdvisor ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-semibold text-lg">
                    Karakteristik Mahasiswa (35%)
                  </span>
                  <div className="font-semibold text-lg">
                    {weightedCharacteristic.toFixed(1)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-semibold text-lg">
                    Penulisan Makalah (35%)
                  </span>
                  <div className="font-semibold text-lg">
                    {weightedWriting.toFixed(1)}
                  </div>
                </div>
              )}
              <div className="border-t border-dashed pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl">Total Nilai</span>
                  <span className={`${scoreColor} font-black text-xl`}>
                    {formattedFinal}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 justify-center mt-8">
              <p className="text-sm font-black uppercase tracking-wide mb-3">
                Total Nilai
              </p>
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
                  <div className="text-xl font-heading font-black text-primary-800">
                    {calculateAverage()}
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
                      strokeDashoffset={
                        263.89 - (263.89 * parseFloat(calculateAverage())) / 100
                      }
                      className="text-primary-600 transition-all duration-500"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-6">
            {hasAssessed && !isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 text-white hover:bg-primary-700 w-full"
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
                  className="border-primary-400 text-primary-foreground w-[25%]"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-primary-600 text-white hover:bg-primary-700 w-[75%]"
                  disabled={isSubmitting || isLoadingSubmit}
                >
                  {isLoadingSubmit ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                      Menyimpan...
                    </span>
                  ) : isSubmitting ? (
                    "Menyimpan..."
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

export default AssessSeminarProposal;
