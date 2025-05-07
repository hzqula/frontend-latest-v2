import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import Logo from "../assets/img/logo.png";

interface Seminar {
  id: number | null;
  title: string;
  student?: { nim: string; name: string } | null;
  status: "DRAFT" | "SUBMITTED" | "SCHEDULED" | "COMPLETED" | null;
  advisors: { lecturerNIP: string; lecturerName?: string }[];
  documents: Record<
    string,
    { uploaded: boolean; fileName?: string; fileURL?: string }
  >;
  time: string | null;
  room: string | null;
  assessors: { lecturerNIP: string; lecturerName?: string }[];
}

interface EvenReportProps {
  seminar: Seminar;
  shouldPrint: boolean;
  onPrintComplete: () => void;
}

const EvenReport = ({
  seminar,
  shouldPrint,
  onPrintComplete,
}: EvenReportProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const seminarDate = seminar.time ? new Date(seminar.time) : null;
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  // Mendapatkan hari, tanggal, dan waktu
  const hari = seminarDate ? dayNames[seminarDate.getDay()] : "N/A";
  const tanggal = seminarDate
    ? seminarDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";
  const waktu = seminarDate
    ? seminarDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB"
    : "N/A";

  const handlePrint = useReactToPrint({
    documentTitle: `[Undangan Seminar Proposal] ${seminar.student?.name} - ${seminar.student?.nim}`,
    pageStyle: `
        @page {
          size: a4;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', Times, serif;
          }
          .printable {
            width: 210mm;
            height: 297mm;
            padding: 15mm 15mm 25mm 25mm;
            box-sizing: border-box;
            position: relative;
          }
        }
      `,
    onAfterPrint: () => onPrintComplete(),
    contentRef: contentRef,
  });

  useEffect(() => {
    if (shouldPrint && handlePrint) {
      handlePrint();
    }
  }, [shouldPrint, handlePrint]);

  return (
    <div ref={contentRef} className="printable hidden print:block text-black">
      <div className="flex mb-4 items-center">
        <div className="w-24 h-24 flex-shrink-0">
          <img src={Logo} alt="Logo" className="w-full h-full" />
        </div>
        <div className="text-center flex-1">
          <p className="font-medium uppercase leading-tight">
            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET DAN TEKNOLOGI
            <br />
            UNIVERSITAS RIAU
            <br />
            FAKULTAS TEKNIK
            <br />
            <span className="font-bold">PROGRAM STUDI TEKNIK LINGKUNGAN</span>
          </p>
          <p className="text-xs mt-1 leading-tight">
            Kampus Binawidya Jl. H. R. Subrantas Simpang Baru, Pekanbaru Riau
            28293 Telp/Fax (0761) 566937
            <br />
            Website: lingkungan.ft.unri.ac.id, email: lingkungan.ft@unri.ac.id
          </p>
        </div>
      </div>

      <div className="border-t border-b border-black my-1"></div>
      <div className="border-t border-b border-black"></div>

      <div className="text-center">
        <h2
          className="text-xl font-bold my-6 leading-tight"
          style={{
            fontSize: "12.5pt",
          }}
        >
          BERITA ACARA
        </h2>
      </div>

      <p
        className="text-sm mb-6"
        style={{
          fontSize: "11pt",
        }}
      >
        Pada hari {hari}, tanggal {tanggal} jam {waktu} WIB telah dilangsungkan
        Seminar Proposal Penelitian mahasiswa Prodi Teknik Lingkungan, Fakultas
        Teknik Universitas Riau:
      </p>

      <div
        className="mb-6 font-bold"
        style={{
          fontSize: "11pt",
        }}
      >
        <div className="flex mb-2">
          <span className="w-40">Nama</span>
          <span>: {seminar.student?.name}</span>
        </div>
        <div className="flex mb-2">
          <span className="w-40">NIM</span>
          <span>: {seminar.student?.nim}</span>
        </div>
        <div className="flex mb-2">
          <span className="w-40">Judul Penelitian</span>
          <span>: {seminar.title}</span>
        </div>
      </div>

      <p
        className="text-sm"
        style={{
          fontSize: "10.5pt",
        }}
      >
        Panitia Seminar Proposal Penelitian tersebut adalah sebagai berikut:
      </p>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2 w-12 text-sm font-bold">
              No
            </th>
            <th className="border border-black p-2 text-sm font-bold">Nama</th>
            <th className="border border-black p-2 text-sm font-bold">
              Panitia Seminar
            </th>
            <th className="border border-black p-2 text-sm font-bold w-32">
              Tanda Tangan
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center">1</td>
            <td className="border border-black p-2">
              {seminar.advisors[0]?.lecturerName}
            </td>
            <td className="border border-black p-2">Ketua</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">2</td>
            <td className="border border-black p-2">
              {seminar.advisors[0]?.lecturerName}
            </td>
            <td className="border border-black p-2">Pembimbing 1</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">3</td>
            <td className="border border-black p-2">
              {seminar.advisors[1]?.lecturerName || "-"}
            </td>
            <td className="border border-black p-2">Pembimbing 2</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">4</td>
            <td className="border border-black p-2">
              {seminar.assessors[0]?.lecturerName || "N/A"}
            </td>
            <td className="border border-black p-2">Penguji 1</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">5</td>
            <td className="border border-black p-2">
              {seminar.assessors[1]?.lecturerName || "N/A"}
            </td>
            <td className="border border-black p-2">Penguji 2</td>
            <td className="border border-black p-2"></td>
          </tr>
        </tbody>
      </table>

      <p
        className="text-sm mb-6"
        style={{
          fontSize: "10.5pt",
        }}
      >
        Seminar Usul Penelitian mahasiswa a.n. <b>{seminar.student?.name}</b>{" "}
        dinyatakan
        <b> lulus/mengulang</b>
      </p>

      <div className="text-start ml-100">
        <p
          className="text-sm mb-20"
          style={{
            fontSize: "10.5pt",
          }}
        >
          Pekanbaru, {tanggal}
          <br />
          Koordinator Prodi Teknik Lingkungan
        </p>

        <p
          className="font-bold text-sm underline"
          style={{
            fontSize: "11pt",
          }}
        >
          Shinta Elystia, S.T., M.Si
          <br />
          NIP.
        </p>
      </div>

      <div className="border border-black text-center text-xs absolute bottom-10 left-20 right-20 py-2">
        <p className="m-0 text-gray-600">
          Visi : Menjadi Program Studi Teknik Lingkungan Yang Unggul Secara
          <br />
          Nasional Dalam Riset Limbah Industri Oleokimia dan Air Gambut Pada
          Tahun 2035
        </p>
      </div>
    </div>
  );
};

export default EvenReport;
