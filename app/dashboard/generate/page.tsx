"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";

export default function GenerateMagneticField() {
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [plotUrl, setPlotUrl] = useState<string | null>(null);

  const [show2DForm, setShow2DForm] = useState(false);
  const [isLoading2D, setIsLoading2D] = useState(false);
  const [plot2DUrl, setPlot2DUrl] = useState<string | null>(null);

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
        setPlotUrl(null);
        return;
      }

      setPlot2DUrl(`${data.url}?t=${Date.now()}`);
    } catch (error) {
      console.error("Eroare la generare grafic 2D:", error);
      setPlot2DUrl(null);
    } finally {
      setIsLoading2D(false);
    }
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
            <Button onClick={() => setShow2DForm(true)} className="flex items-center">
              Generate 2D Cross Section
            </Button>
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

        {/* Afișare grafic 3D */}
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

        {/* Afișare grafic 2D */}
        {plot2DUrl && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
            <iframe
              src={`https://apicampgenerat-production.up.railway.app${plot2DUrl}`}
              className="w-full h-full rounded-lg border-0"
              title="Magnetic Field Cross Section"
            />
          </div>
        )}
      </div>
    </div>
  );
}
