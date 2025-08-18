import KioskDisplay from "@/components/kiosk-display";

interface KioskPageProps {
  params: Promise<{ username: string }>;
}

export default async function KioskPage({ params }: KioskPageProps) {
  const { username } = await params;

  return <KioskDisplay username={username} />;
}

// Generate metadata for sharing
export async function generateMetadata({ params }: KioskPageProps) {
  const { username } = await params;
  
  return {
    title: `${username}'s Now Spinning - Vinyl Kiosk`,
    description: `See what ${username} is currently spinning on vinyl`,
  };
}