"use server"

import { cookies } from "next/headers"

// In a real app, you would use a proper authentication system
// This is a simplified version for demonstration purposes

export async function login(email: string, password: string) {
  // Simulate authentication delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple validation (in a real app, you would verify credentials against a database)
  if (email && password) {
    // Set a cookie to simulate authentication
    cookies().set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  }

  throw new Error("Invalid credentials")
}

export async function register(name: string, email: string, password: string) {
  // Simulate registration delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple validation (in a real app, you would store user data in a database)
  if (name && email && password) {
    // Set a cookie to simulate authentication
    cookies().set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  }

  throw new Error("Registration failed")
}

export async function logout() {
  // Delete the authentication cookie
  cookies().delete("auth")
  return { success: true }
}
