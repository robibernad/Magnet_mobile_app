"use server";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { cookies } from "next/headers";

// Firebase config (înlocuiește cu datele tale)
const firebaseConfig = {
  apiKey: "AIzaSyD8h9YH609T3dbBXKQTdAEFOPqiQAR0WTQ",
  authDomain: "magnet-mobile-app.firebaseapp.com",
  projectId: "magnet-mobile-app",
  storageBucket: "magnet-mobile-app.firebasestorage.app",
  messagingSenderId: "967272698587",
  appId: "1:967272698587:web:5fc81c4d2659b71cac32fe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function register(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date(),
    });

    // Cookie de autentificare (opțional)
    cookies().set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Firebase registration error:", error); 
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    cookies().set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    throw new Error("Registration failed");
  } 
}

export async function logout() {
  cookies().delete("auth");
  return { success: true };
}