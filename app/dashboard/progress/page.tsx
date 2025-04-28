"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

export default function ProgressPage() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('wss://ADRESA-TA-API/websocket-endpoint');
  
    socket.onopen = () => {
      console.log('✅ WebSocket connected');
    };
  
    socket.onmessage = async (event) => {
      console.log('🌐 Date primite prin WebSocket:', event.data);
  
      setIsLoading(true);
  
      try {
        const res = await fetch('https://apicoordonateraspberry-production.up.railway.app/genereaza-imagine/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const data = await res.json();
        setImageSrc(`data:image/png;base64,${data.image_base64}`);
      } catch (error) {
        console.error('❌ Eroare la fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  
    return () => {
      socket.close();
    };
  }, []);
  
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
                Waiting for live measurements...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
