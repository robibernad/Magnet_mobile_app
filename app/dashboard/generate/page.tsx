"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"

export default function GenerateMagneticField() {
  const [isSimulating, setIsSimulating] = useState(false)

  const handleLocalUpload = () => {
    // Trigger file input click
    document.getElementById("local-file-input")?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulate processing the file
      setIsSimulating(true)
      setTimeout(() => {
        setIsSimulating(false)
      }, 2000)
    }
  }

  const handleGoogleDriveUpload = () => {
    // In a real app, this would integrate with Google Drive API
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
    }, 2000)
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
            accept=".csv,.json,.txt"
          />

          <Button onClick={handleGoogleDriveUpload} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload Measurement Data from Google Drive
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
          {isSimulating ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4">Simulating magnetic field...</p>
            </div>
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
