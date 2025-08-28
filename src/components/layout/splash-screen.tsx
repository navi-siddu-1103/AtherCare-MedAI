import Logo from '@/components/logo';

export default function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-16 w-16 animate-pulse text-primary" />
        <p className="text-lg font-semibold text-primary">MediAI</p>
        <p className="text-sm text-muted-foreground">Your personal AI health assistant.</p>
      </div>
    </div>
  );
}
