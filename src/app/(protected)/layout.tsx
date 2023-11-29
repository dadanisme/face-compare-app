"use client";
import { Inter } from "next/font/google";
import "../globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/services/firebase";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user) return router.push("/login");

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
