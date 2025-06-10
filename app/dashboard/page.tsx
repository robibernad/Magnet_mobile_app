import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Menu</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Select an option</p>
        </div>
        <div className="space-y-2">
          <Link href="/dashboard/generate" className="w-full">
            <Button size="lg" className="w-full">
              Generate Magnetic Field
            </Button>
          </Link>
          <Link href="/dashboard/progress" className="w-full">
            <Button size="lg" className="w-full">
              View Progress on Current Measurement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
