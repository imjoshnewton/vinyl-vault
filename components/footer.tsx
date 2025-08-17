"use client";

import Link from "next/link";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Disc3, User } from "lucide-react";

export default function Footer() {
  const { openUserProfile } = useClerk();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              © 2025 Vinyl Vault. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openUserProfile()}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                My Account
              </Button>
            </SignedIn>
            
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </footer>
  );
}