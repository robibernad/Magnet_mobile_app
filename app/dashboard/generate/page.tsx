"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import * as XLSX from "xlsx";

export default function GenerateMagneticField() {
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [plotUrl, setPlotUrl] = useState<string | null>(null);

  const [show2DForm, setShow2DForm] = useState(false);
  const [isLoading2D, setIsLoading2D] = useState(false);
  const [plot2DUrl, setPlot2DUrl] = useState<string | null>(null);
  const [plot2DData, setPlot2DData] = useState<Array<{ x: number, y: number, z: number, value: number }> | null>(null);

  const [zSectionUrl, setZSectionUrl] = useState<string | null>(null);
  const [zSectionData, setZSectionData] = useState<Array<{ x: number, y: number, z: number, value: number }> | null>(null);
  const [zForSection, setZForSection] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [x, setX] = useState<string>("");
  const [y, setY] = useState<string>("");
  const [z, setZ] = useState<string>("");

  const handleLocalUpload = () => {
    document.getElementById("local-file-input")?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsLoading3D(true);

      const formData = new FormData();
      formData.append("file", uploadedFile);

      try {
        const res = await fetch('https://apicampgenerat-production.up.railway.app/api/upload', {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        setPlotUrl(data.url);
      } catch (error) {
        console.error("Upload error:", error);
        setPlotUrl(null);
      } finally {
        setIsLoading3D(false);
      }
    }
  };

  const handleGenerate2DGraph = async () => {
    if (!file) {
      alert("Trebuie să încarci un fișier mai întâi.");
      return;
    }

    const filledFields = [x, y, z].filter((val) => val.trim() !== "");
    if (filledFields.length !== 2) {
      alert("Trebuie să completezi exact două câmpuri numerice.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("x", x);
    formData.append("y", y);
    formData.append("z", z);

    setIsLoading2D(true);

    try {
      const res = await fetch('https://apicampgenerat-production.up.railway.app/api/upload-2d', {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Out of range");
        setPlot2DUrl(null);
        setPlot2DData(null);
        return;
      }

      setPlot2DUrl(`${data.url}?t=${Date.now()}`);
      setPlot2DData(data.table || []);
    } catch (error) {
      console.error("Eroare la generare grafic 2D:", error);
      setPlot2DUrl(null);
      setPlot2DData(null);
    } finally {
      setIsLoading2D(false);
    }
  };

  const handleGenerateZSection = async () => {
    if (!file || !zForSection.trim()) {
      alert("Încarcă un fișier și completează Z-ul.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("z", zForSection);

    try {
      const res = await fetch("https://apicampgenerat-production.up.railway.app/api/z-section", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Eroare la generare secțiune Z.");
        return;
      }

      setZSectionUrl(`${data.url}?t=${Date.now()}`);
      setZSectionData(data.table || []);
    } catch (err) {
      console.error("Z Section Error:", err);
    }
  };

  const handleDownloadTable = () => {
    if (!plot2DData || plot2DData.length === 0) return;

    const filled = [
      x.trim() !== "" ? `x${x.trim()}` : null,
      y.trim() !== "" ? `y${y.trim()}` : null,
      z.trim() !== "" ? `z${z.trim()}` : null,
    ].filter(Boolean);

    let axis = "field";
    if (x.trim() === "") axis = "fieldx";
    else if (y.trim() === "") axis = "fieldy";
    else if (z.trim() === "") axis = "fieldz";

    const filename = `${axis}_${filled.join("_")}.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(plot2DData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MagneticField");

    XLSX.writeFile(workbook, filename);
  };

  const handleDownloadZSection = () => {
    if (!zSectionData || zSectionData.length === 0 || !zForSection) return;

    const worksheet = XLSX.utils.json_to_sheet(zSectionData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Z_Section");

    const filename = `section_z${zForSection.trim()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Generate Magnetic Field</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleLocalUpload} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload Measurement Data
          </Button>
          <input
            id="local-file-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx"
          />

          {file && (
            <>
              <Button onClick={() => setShow2DForm(true)} className="flex items-center">
                Generate 2D Cross Section
              </Button>
            </>
          )}
        </div>

        {show2DForm && (
          <div className="mb-8">
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                placeholder="X"
                value={x}
                onChange={(e) => setX(e.target.value)}
                className="border p-2 rounded w-24"
              />
              <input
                type="number"
                placeholder="Y"
                value={y}
                onChange={(e) => setY(e.target.value)}
                className="border p-2 rounded w-24"
              />
              <input
                type="number"
                placeholder="Z"
                value={z}
                onChange={(e) => setZ(e.target.value)}
                className="border p-2 rounded w-24"
              />
              <Button onClick={handleGenerate2DGraph}>Generate 2D</Button>
            </div>
            <p className="text-sm text-gray-500">Completează exact două valori.</p>
          </div>
        )}

        {file && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Generate Z Section</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                placeholder="Z"
                value={zForSection}
                onChange={(e) => setZForSection(e.target.value)}
                className="border p-2 rounded w-24"
              />
              <Button onClick={handleGenerateZSection}>Generate Z Section</Button>
            </div>
          </div>
        )}

        {/* Grafic 3D */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video mb-8 flex items-center justify-center">
          {isLoading3D ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Generating magnetic field...</p>
            </div>
          ) : plotUrl ? (
            <iframe
              src={`https://apicampgenerat-production.up.railway.app${plotUrl}`}
              className="w-full h-full rounded-lg border-0"
              title="Magnetic Field Plot 3D"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Magnetic Field Visualization</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Upload data to generate visualization</p>
            </div>
          )}
        </div>

        {/* Grafic 2D */}
        {plot2DUrl && (
          <>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
              <iframe
                src={`https://apicampgenerat-production.up.railway.app${plot2DUrl}`}
                className="w-full h-full rounded-lg border-0"
                title="Magnetic Field Cross Section"
              />
            </div>

            {plot2DData && plot2DData.length > 0 && (
              <>
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <tr>
                        <th className="px-3 py-2 border">X</th>
                        <th className="px-3 py-2 border">Y</th>
                        <th className="px-3 py-2 border">Z</th>
                        <th className="px-3 py-2 border">Value (T)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plot2DData.map((row, index) => (
                        <tr key={index} className="text-center">
                          <td className="px-3 py-1 border">{row.x}</td>
                          <td className="px-3 py-1 border">{row.y}</td>
                          <td className="px-3 py-1 border">{row.z}</td>
                          <td className="px-3 py-1 border">{row.value.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleDownloadTable} className="mt-4">
                  Download Table as .xlsx
                </Button>
              </>
            )}
          </>
        )}

        {/* Grafic Z Section */}
        {zSectionUrl && (
          <>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center mt-10">
              <iframe
                src={`https://apicampgenerat-production.up.railway.app${zSectionUrl}`}
                className="w-full h-full rounded-lg border-0"
                title="Z Section Plot"
              />
            </div>

            {zSectionData && zSectionData.length > 0 && (
              <>
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <tr>
                        <th className="px-3 py-2 border">X</th>
                        <th className="px-3 py-2 border">Y</th>
                        <th className="px-3 py-2 border">Z</th>
                        <th className="px-3 py-2 border">Value (T)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zSectionData.map((row, index) => (
                        <tr key={index} className="text-center">
                          <td className="px-3 py-1 border">{row.x}</td>
                          <td className="px-3 py-1 border">{row.y}</td>
                          <td className="px-3 py-1 border">{row.z}</td>
                          <td className="px-3 py-1 border">{row.value.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleDownloadZSection} className="mt-4">
                  Download Z Section as .xlsx
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
