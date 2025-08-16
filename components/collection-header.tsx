"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Disc3 } from "lucide-react";
import AddRecordDialog from "@/components/add-record-dialog";

export default function CollectionHeader() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Disc3 className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold">Vinyl Vault</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <AddRecordDialog />
          <UserButton afterSignOutUrl="/" />
        </nav>
      </div>
    </header>
  );
}