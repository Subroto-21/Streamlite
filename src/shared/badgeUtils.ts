import { BADGE_PRIORITY, type ChatBadge } from "./types";

const VALID_BADGE_SET = new Set<string>(BADGE_PRIORITY);

// Accepts raw string types (not restricted to ChatBadge) so it works with
// the full mixed type set from the payload including unknown future badges.
export function derivePrimaryRole(badgeTypes: string[]): ChatBadge | "user" {
  for (const role of BADGE_PRIORITY) {
    if (badgeTypes.includes(role)) return role;
  }
  return "user";
}

// Returns a fallback imageUrl + label for legacy role badges that don't carry
// an image_url in the Kick payload. These local SVGs are placeholder assets -
// replace with real artwork. badge_type=global badges (level, etc.) always have
// image_url in the payload so they never hit this path.
// WHY local SVGs for role badges: no confirmed public CDN URL pattern for Kick
// role badge images; subscriber badges can be channel-specific. Placeholder
// approach is intentional - update once CDN URL is confirmed from live traffic.
export const BADGE_META: Record<ChatBadge, { icon: string; label: string }> = {
  broadcaster: { icon: "/badges/broadcaster.svg", label: "Broadcaster" },
  moderator: { icon: "/badges/moderator.svg", label: "Moderator" },
  staff: { icon: "/badges/staff.svg", label: "Kick Staff" },
  verified: { icon: "/badges/verified.svg", label: "Verified" },
  sidekick: { icon: "/badges/sidekick.svg", label: "Sidekick" },
  founder: { icon: "/badges/founder.svg", label: "Founder" },
  og: { icon: "/badges/og.svg", label: "OG" },
  vip: { icon: "/badges/vip.svg", label: "VIP" },
  subscriber: { icon: "/badges/subscriber.svg", label: "Subscriber" },
  subgifter: { icon: "/badges/subgifter.svg", label: "Sub Gifter" },
  subgifter25: { icon: "/badges/subgifter25.svg", label: "Sub Gifter (25+)" },
  subgifter50: { icon: "/badges/subgifter50.svg", label: "Sub Gifter (50+)" },
  subgifter100: {
    icon: "/badges/subgifter100.svg",
    label: "Sub Gifter (100+)",
  },
};

export function getBadgeFallback(
  type: string,
  text?: string,
): { imageUrl: string; label: string } {
  if (VALID_BADGE_SET.has(type)) {
    const m = BADGE_META[type as ChatBadge];
    return { imageUrl: m.icon, label: m.label };
  }
  // Unknown type - no local asset; imageUrl intentionally empty so onerror fires
  if (import.meta.env.DEV) {
    console.warn("[badgeUtils] no local asset for badge type:", type);
  }
  return { imageUrl: "", label: text ?? type };
}

// Builds a human-readable label for a badge, handling Kick-specific metadata.
export function getBadgeLabel(
  name: string,
  metadata?: Record<string, unknown>,
  text?: string,
): string {
  if (name === "level" && typeof metadata?.level === "number") {
    return `Level ${metadata.level}`;
  }
  if (VALID_BADGE_SET.has(name)) return BADGE_META[name as ChatBadge].label;
  return text ?? name.charAt(0).toUpperCase() + name.slice(1);
}

// Role-based name colour when Kick doesn't supply a per-user chat colour.
export const ROLE_COLOR_FALLBACK: Partial<Record<ChatBadge | "user", string>> =
  {
    broadcaster: "#53fc18",
    moderator: "#4ade80",
    staff: "#818cf8",
    founder: "#a78bfa",
    og: "#fbbf24",
    vip: "#f472b6",
  };

// Dev self-test
if (import.meta.env.DEV) {
  const cases: [string[], ChatBadge | "user"][] = [
    [["vip", "subscriber"], "vip"],
    [["moderator", "vip", "subscriber"], "moderator"],
    [["subscriber"], "subscriber"],
    [["subgifter100", "subgifter25"], "subgifter100"],
    [["level"], "user"], // global badge, not a role
    [[], "user"],
  ];
  let passed = 0;
  for (const [input, expected] of cases) {
    const result = derivePrimaryRole(input);
    if (result !== expected) {
      console.error("[badgeUtils] FAIL derivePrimaryRole", {
        input,
        expected,
        result,
      });
    } else {
      passed++;
    }
  }
  if (passed === cases.length)
    console.log(`[badgeUtils] all ${passed} self-tests passed`);
}
