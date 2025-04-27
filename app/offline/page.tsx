import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function Offline() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="text-3xl font-bold">You're offline</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The content you're trying to access is not available offline.
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
