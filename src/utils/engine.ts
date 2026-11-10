import { getRequirementClaim } from "./foodNeeds";
import { origins } from "../data/restaurants";
import type {
  Diner,
  DinerMatch,
  Filters,
  Meal,
  Profile,
  Requirement,
  Result,
  Restaurant,
  Support,
} from "../types";
export function defaultFilters(): Filters {
  return {
    requirements: [],
    strict: true,
    independent: false,
    mode: "personal",
    diners: Array.from({ length: 6 }, (_, i) => ({
      label: `Person ${i + 1}`,
      requirements: [],
    })),
    origin: "uw",
    radius: 5,
    query: "",
    sort: "nearest",
  };
}
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const x =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export function effectiveSupport(
  meal: Meal,
  req: Requirement,
  independent: boolean,
): Support {
  const c = getRequirementClaim(meal, req);
  if (
    c.support === "supported" &&
    (c.provenance === "unknown" ||
      (independent && c.provenance !== "independent") ||
      (req === "certifiedHalal" &&
        (!c.certification || c.provenance !== "independent")))
  )
    return "unknown";
  return c.support;
}
const rank = { supported: 3, partial: 2, unknown: 1, unsupported: 0 };
export function evaluateDiner(
  restaurant: Restaurant,
  diner: Diner,
  independent: boolean,
  query = "",
): DinerMatch {
  const mains = restaurant.meals.filter(
    (m) =>
      m.main &&
      (!query ||
        `${m.name} ${m.description}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const scored = mains
    .map((meal) => {
      const results = diner.requirements.map((requirement) => ({
        requirement,
        support: effectiveSupport(meal, requirement, independent),
        claim: getRequirementClaim(meal, requirement),
      }));
      const status: DinerMatch["status"] = results.some(
        (r) => r.support === "unsupported",
      )
        ? "none"
        : results.every((r) => r.support === "supported")
          ? "full"
          : "partial";
      return {
        meal,
        results,
        status,
        score: results.reduce((s, r) => s + rank[r.support], 0),
      };
    })
    .sort(
      (a, b) =>
        ({ full: 2, partial: 1, none: 0 })[b.status] -
          { full: 2, partial: 1, none: 0 }[a.status] ||
        b.score - a.score ||
        a.meal.price - b.meal.price,
    );
  const best = scored[0];
  return {
    diner,
    status: (best?.status as DinerMatch["status"]) ?? "none",
    meals: scored.filter((m) => m.status === "full").map((m) => m.meal),
    bestMeal: best?.meal,
    requirements: best?.results ?? [],
    supported:
      best?.results.filter((r) => r.support === "supported").length ?? 0,
  };
}
export function groupCost(restaurant: Restaurant, count: number) {
  return restaurant.price[1] * count;
}
export function evaluateRestaurant(
  restaurant: Restaurant,
  filters: Filters,
): Result {
  const query = filters.query.trim().toLowerCase();
  const generalSearch = `${restaurant.name} ${restaurant.cuisine}`
    .toLowerCase()
    .includes(query);
  const diners = (
    filters.mode === "group"
      ? filters.diners
      : [{ label: "Your meal", requirements: filters.requirements }]
  ).map((d) =>
    evaluateDiner(
      restaurant,
      d,
      filters.independent,
      generalSearch ? "" : query,
    ),
  );
  const distance = distanceKm(origins[filters.origin], restaurant);
  const count = filters.mode === "group" ? filters.diners.length : 1;
  const estimate = groupCost(restaurant, count);
  const reasons: string[] = [];
  if (distance > filters.radius) reasons.push("Outside selected distance");
  if (restaurant.capacity < count)
    reasons.push("Group exceeds stated capacity");
  const status =
    reasons.length || diners.some((d) => d.status === "none")
      ? "none"
      : diners.every((d) => d.status === "full")
        ? "full"
        : "partial";
  return {
    restaurant,
    distance,
    status,
    diners,
    supported: diners.reduce((s, d) => s + d.supported, 0),
    total: diners.reduce((s, d) => s + d.diner.requirements.length, 0),
    estimate,
    reasons,
  };
}
export function filterRestaurants(restaurants: Restaurant[], filters: Filters) {
  return restaurants
    .map((r) => evaluateRestaurant(r, filters))
    .filter(
      (r) => r.status !== "none" && (!filters.strict || r.status === "full"),
    )
    .sort((a, b) => {
      const status = Number(b.status === "full") - Number(a.status === "full");
      if (status) return status;
      if (filters.sort === "price")
        return (
          a.restaurant.price[1] - b.restaurant.price[1] ||
          a.distance - b.distance
        );
      if (filters.sort === "match")
        return b.supported - a.supported || a.distance - b.distance;
      return a.distance - b.distance;
    });
}
export function profileFromFilters(f: Filters): Profile {
  return {
    requirements: [...f.requirements],
    strict: f.strict,
    independent: f.independent,
  };
}
export function applyProfile(f: Filters, p: Profile): Filters {
  return {
    ...f,
    mode: "personal",
    requirements: [...p.requirements],
    strict: p.strict,
    independent: p.independent,
  };
}
export function validateFilters(f: Filters): string | null {
  if (f.diners.length < 1 || f.diners.length > 20)
    return "Choose between 1 and 20 diners.";
  if (f.radius < 1 || f.radius > 20)
    return "Choose a distance between 1 and 20 km.";
  return null;
}
