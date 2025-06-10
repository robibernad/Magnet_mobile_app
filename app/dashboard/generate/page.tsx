"use client";

import { useState, useRef } from "react";
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

  const [sectionUrl, setSectionUrl] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<Array<{ x: number, y: number, z: number, value: number }> | null>(null);
  const [sectionLabel, setSectionLabel] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [x, setX] = useState<string>("");
  const [y, setY] = useState<string>("");
  const [z, setZ] = useState<string>("");

  const [show2DTable, setShow2DTable] = useState(true);
  const [showSectionTable, setShowSectionTable] = useState(true);

  const ref2D = useRef<HTMLDivElement>(null);
  const refSection = useRef<HTMLDivElement>(null);

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

        if (!res.ok) throw new Error("Upload failed");
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
    if (!file) return alert("Upload a file");

    const filledFields = [x, y, z].filter((val) => val.trim() !== "");
    if (filledFields.length !== 2) return alert("Add 2 values");

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
      if (!res.ok) return alert(data.error || "Out of range");

      setPlot2DUrl(`${data.url}?t=${Date.now()}`);
      setPlot2DData(data.table || []);
    } catch (error) {
      console.error("Error 2D generation", error);
    } finally {
      setIsLoading2D(false);
    }
  };

  const handleGenerateSection = async () => {
    if (!file) return alert("Upload a file");

    const coords = { x: x.trim(), y: y.trim(), z: z.trim() };
    const filled = Object.entries(coords).filter(([_, val]) => val !== "");
    if (filled.length !== 1) return alert("Add 1 value");

    const [axis, value] = filled[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("axis", axis);
    formData.append("value", value);

    try {
      const res = await fetch("https://apicampgenerat-production.up.railway.app/api/section-1d", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Section view error");

      setSectionUrl(`${data.url}?t=${Date.now()}`);
      setSectionData(data.table || []);
      setSectionLabel(`${axis}${value}`);
    } catch (error) {
      console.error("Section Error:", error);
    }
  };

  const handleDownloadSection = () => {
    if (!sectionData || !sectionLabel) return;
    const ws = XLSX.utils.json_to_sheet(sectionData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Section");
    XLSX.writeFile(wb, `section_${sectionLabel}.xlsx`);
  };

  const handleDownloadTable = () => {
    if (!plot2DData) return;
    const filled = [x.trim() && `x${x}`, y.trim() && `y${y}`, z.trim() && `z${z}`].filter(Boolean);
    let axis = x === "" ? "fieldx" : y === "" ? "fieldy" : "fieldz";
    const filename = `${axis}_${filled.join("_")}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(plot2DData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MagneticField");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-6">Generate Magnetic Field</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleLocalUpload} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" /> Upload Measurement Data
          </Button>
          <input id="local-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx" />

          {file && (
            <Button onClick={() => setShow2DForm(true)} className="flex items-center">
              Generate 2D Cross Section
            </Button>
          )}
        </div>

        {show2DForm && (
          <div className="mb-8">
            <div className="flex gap-4 mb-4">
              <input type="number" placeholder="X" value={x} onChange={(e) => setX(e.target.value)} className="border p-2 rounded w-24" />
              <input type="number" placeholder="Y" value={y} onChange={(e) => setY(e.target.value)} className="border p-2 rounded w-24" />
              <input type="number" placeholder="Z" value={z} onChange={(e) => setZ(e.target.value)} className="border p-2 rounded w-24" />
              <Button onClick={handleGenerate2DGraph}>Generate 2D</Button>
              <Button onClick={handleGenerateSection}>Generate Section</Button>
            </div>
            <p className="text-sm text-gray-500">For 2D section add exactly 2 values. For section-view add only 1 value.</p>
          </div>
        )}

        {/* 3D */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video mb-8 flex items-center justify-center">
          {isLoading3D ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent"></div>
              <p className="mt-4">Generating magnetic field...</p>
            </div>
          ) : plotUrl ? (
            <iframe src={`https://apicampgenerat-production.up.railway.app${plotUrl}`} className="w-full h-full rounded-lg border-0" title="Magnetic Field Plot 3D" />
          ) : (
            <div className="text-center text-gray-500">Upload data to generate visualization</div>
          )}
        </div>

        {/* 2D */}
        {plot2DUrl && plot2DData && (
          <div ref={ref2D}>
            <iframe src={`https://apicampgenerat-production.up.railway.app${plot2DUrl}`} className="w-full aspect-video rounded-lg border-0" title="2D Cross Section" />
            <Button onClick={() => setShow2DTable((p) => !p)} className="mt-4">{show2DTable ? "Hide" : "Show"} 2D Table</Button>
            {show2DTable && (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr><th>X</th><th>Y</th><th>Z</th><th>Value (T)</th></tr>
                    </thead>
                    <tbody>
                      {plot2DData.map((row, i) => (
                        <tr key={i} className="text-center">
                          <td>{row.x}</td><td>{row.y}</td><td>{row.z}</td><td>{row.value.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleDownloadTable} className="mt-2">Download 2D Table</Button>
              </>
            )}
          </div>
        )}

        {/* Section view */}
        {sectionUrl && sectionData && (
          <div ref={refSection} className="mt-12">
            <iframe src={`https://apicampgenerat-production.up.railway.app${sectionUrl}`} className="w-full aspect-video rounded-lg border-0" title="Section Plot" />
            <Button onClick={() => setShowSectionTable((p) => !p)} className="mt-4">{showSectionTable ? "Hide" : "Show"} Section Table</Button>
            {showSectionTable && (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr><th>X</th><th>Y</th><th>Z</th><th>Value (T)</th></tr>
                    </thead>
                    <tbody>
                      {sectionData.map((row, i) => (
                        <tr key={i} className="text-center">
                          <td>{row.x}</td><td>{row.y}</td><td>{row.z}</td><td>{row.value.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleDownloadSection} className="mt-2">Download Section Table</Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      {(plot2DUrl || sectionUrl) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          {plot2DUrl && (
            <Button onClick={() => ref2D.current?.scrollIntoView({ behavior: "smooth" })} variant="outline">Go to 2D Table</Button>
          )}
          {sectionUrl && (
            <Button onClick={() => refSection.current?.scrollIntoView({ behavior: "smooth" })} variant="outline">Go to Section Table</Button>
          )}
        </div>
      )}
    </div>
  );
}
