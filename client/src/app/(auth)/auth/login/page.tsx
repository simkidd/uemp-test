import { Metadata } from "next";
import { LoginView } from "@/components/views/auth/LoginView";

export const metadata: Metadata = {
  title: "Portal Sign In | UEMP",
  description: "Official institutional login for students, faculty, and administrators.",
};

export default function LoginPage() {
  return <LoginView />;
}
