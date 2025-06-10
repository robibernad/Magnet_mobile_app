import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { RegisterForm } from "@/components/register-form"

export default function Register() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has("auth")

  if (isLoggedIn) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Register a new account</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
