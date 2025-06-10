import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LogoutButton } from "@/components/logout-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has("auth")

  if (!isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-4 left-4">
        <LogoutButton />
      </div>
    </div>
  )
}
