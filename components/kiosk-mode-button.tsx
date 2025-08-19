"use client";

import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { useRouter } from "next/navigation";

interface KioskModeButtonProps {
  username: string;
}

export default function KioskModeButton({ username }: KioskModeButtonProps) {
  const router = useRouter();

  const handleKioskMode = () => {
    router.push(`/u/${username}/kiosk`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleKioskMode}
      className="gap-2"
    >
      <Monitor className="w-4 h-4" />
      Now Spinning
    </Button>
  );
}