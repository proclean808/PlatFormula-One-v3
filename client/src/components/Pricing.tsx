// Product interaction style: preserve the dark racing-control pricing deck while adding
// clear tier-action states through restrained dialogs and high-contrast blue/violet accents.
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, Building2, Sparkles } from "lucide-react";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaVariant?: "default" | "outline";
}

const tiers: PricingTier[] = [
  {
    name: "Founder",
    price: "$0",
    period: "waitlist signup",
    description: "Explore the founder workspace and reserve your place for Free Tier launch updates.",
    icon: Zap,
    color: "blue",
    features: [
      "Public resource directory",
      "Self-guided concept and application tools",
      "Local founder brief and Markdown export",
      "Pitch outline editor with heuristic checks",
      "Consent-based Free Tier waiting list",
      "Cloud assistant requires sign-in and project credits",
    ],
    cta: "Start Free",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    price: "$29",
    period: "month · proposed",
    description: "Planned founder workflow expansion. Not available for purchase; scope and price may change.",
    icon: Rocket,
    color: "purple",
    badge: "Coming Soon",
    features: [
      "Planned: connected coding-agent workflow",
      "Planned: persistent founder context",
      "Planned: richer presentation exports",
      "Planned: evidence-based growth workspace",
      "Availability and usage limits to be confirmed",
    ],
    cta: "Pro — Coming Soon",
  },
  {
    name: "Studio",
    price: "$99",
    period: "month · proposed",
    description: "Planned venture-studio coordination. Not available for purchase; integrations require separate testing.",
    icon: Building2,
    color: "amber",
    features: [
      "Planned: multi-agent coordination",
      "Planned: authorized phone-session workflows",
      "Planned: conversational presentation support",
      "Planned: verifiable execution receipts",
      "No autonomous payments or live device control today",
    ],
    cta: "Studio — Coming Soon",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; btn: string; badge: string }> = {
  blue:   { border: "border-blue-500/40",   bg: "bg-blue-500/5",   text: "text-blue-400",   btn: "bg-blue-600 hover:bg-blue-700 text-white",   badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  purple: { border: "border-purple-500/50", bg: "bg-purple-500/10", text: "text-purple-400", btn: "bg-purple-600 hover:bg-purple-700 text-white", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  amber:  { border: "border-amber-500/40",  bg: "bg-amber-500/5",  text: "text-amber-400",  btn: "bg-amber-600 hover:bg-amber-700 text-white",  badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
};

export function Pricing() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [comingSoonTier, setComingSoonTier] = useState<string | null>(null);

  return (
    <section className="space-y-8 py-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          Pick Your Launch Trajectory
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore the workspace now. Join the Free Tier waiting list. Paid plans remain Coming Soon.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const c = colorMap[tier.color];
          return (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${c.border} ${c.bg} ${tier.badge ? "ring-2 ring-purple-500/40" : ""}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`${c.badge} border text-xs font-semibold px-3 py-1`}>
                    {tier.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className={`text-xl ${c.text}`}>{tier.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/{tier.period}</span>
                </div>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-6">
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${c.text}`} />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${tier.ctaVariant === "outline"
                    ? `border ${c.border} ${c.text} bg-transparent hover:${c.bg}`
                    : c.btn}`}
                  variant={tier.ctaVariant === "outline" ? "outline" : "default"}
                  onClick={() => tier.name === "Founder" ? setWaitlistOpen(true) : setComingSoonTier(tier.name)}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        No payments or paid trials are enabled. Embedded cloud-model calls consume project credits; waitlist signup is not a promise of unlimited inference.
      </p>

      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
      <Dialog open={Boolean(comingSoonTier)} onOpenChange={(open) => !open && setComingSoonTier(null)}>
        <DialogContent className="border-purple-500/40 bg-[#10101a] text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-500/10 text-purple-300"><Sparkles className="h-5 w-5" /></div>
            <DialogTitle className="text-xl text-purple-300">{comingSoonTier} is coming soon</DialogTitle>
            <DialogDescription className="leading-relaxed">We’re preparing the full {comingSoonTier} experience. Join the Free Tier waiting list to receive launch updates and early-access news.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComingSoonTier(null)}>Close</Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => { setComingSoonTier(null); setWaitlistOpen(true); }}>Join Free Tier waitlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
