import { useAuth } from "../context/AuthContext";
import { Outlet } from "react-router-dom";
import ProfileSetup from "./ProfileSetup";

export default function OnboardingGate() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#38000A] flex items-center justify-center text-[#CD1C18]">Loading...</div>;
  }

  // If the profile explicitly requires onboarding, trap them in the Setup screen
  if (userProfile?.needsOnboarding) {
    return <ProfileSetup />;
  }

  // Otherwise, render the nested private routes
  return <Outlet />;
}
