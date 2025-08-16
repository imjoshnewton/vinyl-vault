import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Disc3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">Vinyl Vault</span>
          </div>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/collection">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  My Collection
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Your Personal
            <span className="text-purple-500"> Vinyl Collection</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Organize, track, and discover your vinyl records with style.
            Never forget what&apos;s in your collection again.
          </p>
          
          <div className="flex gap-4 justify-center mb-20">
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Get Started Free
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/collection">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  View Collection
                </Button>
              </Link>
            </SignedIn>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-white border-gray-600">
                Learn More
              </Button>
            </Link>
          </div>

          <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Disc3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Catalog Your Collection</h3>
              <p className="text-gray-400">
                Keep track of all your LPs, Singles, and EPs in one organized place.
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Random Discovery</h3>
              <p className="text-gray-400">
                Spin the dice to randomly select a record from your collection to play next.
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Statistics</h3>
              <p className="text-gray-400">
                Monitor your collection growth, play counts, and listening habits over time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}