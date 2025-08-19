import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerViewingBanner() {
  return (
    <div className="bg-gradient-to-r from-stone-800 to-stone-700 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <div className="text-center sm:text-left">
            <p className="font-semibold">This is your collection!</p>
            <p className="text-sm text-stone-200">
              You&apos;re viewing the public version of your collection page.
            </p>
          </div>
        </div>
        <Link href="/collection">
          <Button 
            variant="secondary" 
            className="gap-2 bg-white text-stone-800 hover:bg-stone-100"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}