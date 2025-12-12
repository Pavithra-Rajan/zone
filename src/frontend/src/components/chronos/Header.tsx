import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center gap-3 mb-8 animate-fade-in">
      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Zone</h1>
        <p className="text-sm text-muted-foreground">Plan your day like never before</p>
      </div>
    </header>
  );
}
