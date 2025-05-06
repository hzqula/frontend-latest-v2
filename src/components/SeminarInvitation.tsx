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

interface SeminarInvitationProps {
  seminar: Seminar;
  shouldPrint: boolean;
  onPrintComplete: () => void;
}

const SeminarInvitation = ({
  seminar,
  shouldPrint,
  onPrintComplete,
}: SeminarInvitationProps) => {
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
    contentRef: contentRef, // Use contentRef instead of content
  });

  // Trigger printing when shouldPrint becomes true
  useEffect(() => {
    if (shouldPrint && handlePrint) {
      handlePrint();
    }
  }, [shouldPrint, handlePrint]);

  return (
    <div ref={contentRef} className="printable hidden print:block text-black">
      {/* Header */}
      <div className="flex mb-4 items-center">
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={Logo}
            alt="Logo Universitas Riau"
            className="w-full h-full"
          />
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

      {/* Garis Pemisah */}
      <div className="border-t-2 border-b-2 border-black my-2 h-1"></div>

      {/* Nomor, Lampiran, Hal */}
      <div className="mt-4 text-sm">
        <div className="flex mb-1">
          <span className="w-24 font-bold">Nomor</span>
          <span>: /UN19.5.1.1.7/TL/DL/2025</span>
        </div>
        <div className="flex mb-1">
          <span className="w-24 font-bold">Lampiran</span>
          <span>: 1 (satu) berkas</span>
        </div>
        <div className="flex mb-4">
          <span className="w-24 font-bold">Hal</span>
          <span>
            : Undangan <b>Seminar Proposal</b>
          </span>
        </div>
      </div>

      {/* Kepada Yth */}
      <div className="mb-4 text-sm">
        <div className="font-bold flex">
          Kepada Yth. : Bapak/Ibu
          <div className="list-decimal pl-10 mt-1">
            <div className="flex mb-1">
              <span className="w-80">1. Ketua Seminar</span>
              <span>(Ketua)</span>
            </div>
            <div className="flex mb-1">
              <span className="w-80">
                2. {seminar.advisors[0]?.lecturerName || "N/A"}
              </span>
              <span>(Pembimbing 1)</span>
            </div>
            {seminar.advisors[1] && (
              <div className="flex mb-1">
                <span className="w-80">
                  3. {seminar.advisors[1]?.lecturerName || "N/A"}
                </span>
                <span>(Pembimbing 2)</span>
              </div>
            )}
            <div className="flex mb-1">
              <span className="w-80">
                {seminar.advisors[1] ? "4" : "3"}.{" "}
                {seminar.assessors[0]?.lecturerName ||
                  seminar.assessors[0]?.lecturerNIP ||
                  "N/A"}
              </span>
              <span>(Penguji 1)</span>
            </div>
            {seminar.assessors[1] && (
              <div className="flex mb-1">
                <span className="w-80">
                  {seminar.advisors[1] ? "5" : "4"}.{" "}
                  {seminar.assessors[1]?.lecturerName ||
                    seminar.assessors[1]?.lecturerNIP ||
                    "N/A"}
                </span>
                <span>(Penguji 2)</span>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2">
          di
          <br />
          Pekanbaru
        </p>
      </div>

      {/* Isi Undangan */}
      <div className="mb-4 text-sm">
        <p className="mb-2">Dengan hormat,</p>
        <p>
          Bersama ini kami mengundang Bapak/Ibu sebagai{" "}
          <b>Pembimbing / Penguji</b> pada <b>Seminar Proposal</b> atas nama
          mahasiswa berikut:
        </p>
      </div>

      {/* Data Mahasiswa dan Jadwal */}
      <div className="mb-4 text-sm font-bold">
        <div className="flex mb-1">
          <span className="w-36">Nama</span>
          <span>: {seminar.student?.name || "N/A"}</span>
        </div>
        <div className="flex mb-1">
          <span className="w-36">NIM</span>
          <span>: {seminar.student?.nim || "N/A"}</span>
        </div>
        <div className="flex mb-3">
          <span className="w-36">Judul Penelitian</span>
          <span>: {seminar.title || "N/A"}</span>
        </div>
        <p className="mb-2 font-medium">
          Seminar Proposal ini akan diselenggarakan pada:
        </p>
        <div className="flex mb-1">
          <span className="w-36">Hari / Tanggal</span>
          <span>
            :{" "}
            {seminar.time
              ? `${
                  dayNames[seminarDate!.getDay()]
                } / ${seminarDate!.toLocaleDateString("id-ID")}`
              : "N/A"}
          </span>
        </div>
        <div className="flex mb-1">
          <span className="w-36">Pukul</span>
          <span>
            :{" "}
            {seminar.time
              ? `${seminarDate!.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} WIB`
              : "N/A"}
          </span>
        </div>
        <div className="flex mb-3">
          <span className="w-36">Tempat</span>
          <span>: {seminar.room || "N/A"}</span>
        </div>
      </div>

      {/* Penutup */}
      <p className="text-sm mb-6">
        Demikianlah undangan ini disampaikan, atas perhatian dan kerjasamanya
        diucapkan terimakasih.
      </p>

      {/* Tanda Tangan */}
      <div className="flex justify-end pr-12">
        <div className="text-sm ">
          <p className="mb-20">
            Pekanbaru,{" "}
            {seminar.time ? seminarDate!.toLocaleDateString("id-ID") : "N/A"}
            <br />
            Koordinator Prodi Teknik Lingkungan
          </p>
          <p className="font-bold">
            <span className="underline">Aryo Sasmita, S.T., M.T</span>
            <br />
            NIP. 19860612 201212 1 003
          </p>
        </div>
      </div>

      {/* Footer (Visi) */}
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

export default SeminarInvitation;
