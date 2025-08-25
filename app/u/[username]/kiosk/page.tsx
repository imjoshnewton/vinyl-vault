import KioskDisplay from "@/components/kiosk-display";
import { getNowSpinningAction } from "@/actions/now-spinning.actions";
import { NowSpinningProvider } from "@/providers/now-spinning-provider";

interface KioskPageProps {
  params: Promise<{ username: string }>;
}

export default async function KioskPage({ params }: KioskPageProps) {
  const { username } = await params;
  
  // Get initial now spinning data
  const nowSpinningResult = await getNowSpinningAction(username);
  const initialNowSpinning = nowSpinningResult.success ? nowSpinningResult.nowSpinning : null;

  return (
    <NowSpinningProvider 
      username={username} 
      enablePolling={true}
      pollingInterval={15000} // 15 seconds for kiosk (more frequent updates)
      initialData={initialNowSpinning}
    >
      <KioskDisplay username={username} />
    </NowSpinningProvider>
  );
}

// Generate metadata for sharing
export async function generateMetadata({ params }: KioskPageProps) {
  const { username } = await params;
  
  return {
    title: `${username}'s Now Spinning - Vinyl Kiosk`,
    description: `See what ${username} is currently spinning on vinyl`,
  };
}