"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

export default function ProgressPage() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);  // 🆕 adăugat progress

  const handleFetchImage = async () => {
    try {
      setIsLoading(true);

      // 🔵 Primim ultimele coordonate + progres
      const coordRes = await fetch('https://apicoordonateraspberry-production.up.railway.app/get-latest-coordinates/');
      const coords = await coordRes.json();

      setProgress(coords.progress); // 🆕 setăm progresul local

      const res = await fetch('https://apicoordonateraspberry-production.up.railway.app/genereaza-imagine/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coords),
      });

      const data = await res.json();
      setImageSrc(`data:image/png;base64,${data.image_base64}`);
    } catch (error) {
      console.error('❌ Eroare la fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center mb-6 gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>

          <Button 
            onClick={handleFetchImage} 
            className="flex items-center bg-black text-white hover:bg-gray-800"
          >
            <Play className="mr-2 h-4 w-4" />
            View Current Measurement
          </Button>
        </div>

        {/* Vizualizare */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading measurement...</p>
            </div>
          ) : imageSrc ? (
            <img src={imageSrc} alt="Measurement Visualization" className="rounded-lg max-h-full" />
          ) : (
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No data yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Click "View Current Measurement" to start
              </p>
            </div>
          )}
        </div>

        {/* 🔵 Progress bar */}
        <div className="w-full mt-6">
          <p className="text-center mb-2">Progress: {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
