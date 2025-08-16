import { Suspense } from "react";
import { authService } from "@/services/auth.service";
import { redirect } from "next/navigation";
import SetupProfileForm from "@/components/setup-profile-form";

export default async function SetupProfilePage() {
  const user = await authService.getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  // If user already has username, redirect to their collection
  if (user.username) {
    redirect(`/u/${user.username}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Setup Your Profile</h1>
            <p className="text-muted-foreground">
              Choose a username to create your shareable vinyl collection
            </p>
          </div>
          
          <Suspense fallback={<div>Loading...</div>}>
            <SetupProfileForm user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}