"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"

export default function GenerateMagneticField() {
  const [isLoading, setIsLoading] = useState(false)
  const [plotUrl, setPlotUrl] = useState<string | null>(null)

  const handleLocalUpload = () => {
    document.getElementById("local-file-input")?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch('https://apicampgenerat-production.up.railway.app/api/upload', {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          throw new Error("Upload failed")
        }

        const data = await res.json()
        setPlotUrl(data.url)
      } catch (error) {
        console.error("Upload error:", error)
        setPlotUrl(null)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
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
            Upload Measurement Data from Local Storage
          </Button>
          <input
            id="local-file-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx"
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Generating magnetic field...</p>
            </div>
          ) : plotUrl ? (
            <iframe
              src={`https://apicampgenerat-production.up.railway.app${plotUrl}`}
              className="w-full h-full rounded-lg border-0"
              title="Magnetic Field Plot"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Magnetic Field Visualization</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Upload data to generate visualization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
