import {
  allergenLabels,
  requirements,
  type Allergen,
  type AllergenRecord,
  type Meal,
  type NutritionFacts,
} from "../types";
import { getRequirementClaim } from "../utils/foodNeeds";
interface FoodFixture {
  contains: Allergen[];
  complete?: boolean;
  handling?: "documented" | "shared" | "unknown";
  independent?: boolean;
  nutrition?: [carbs: number, sugars: number, added: number, fiber: number];
}
// Explicit fictional recipe fixtures. No ingredient or dietary state is inferred from menu text.
const fixtures: Record<string, FoodFixture> = {
  g1: {
    contains: ["sesame"],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [48, 8, 2, 11],
  },
  g2: { contains: ["sesame", "wheat"], complete: true, handling: "shared" },
  g3: { contains: ["milk"], complete: true, handling: "unknown" },
  g4: {
    contains: [],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [42, 4, 0, 12],
  },
  s1: { contains: ["milk"], handling: "unknown", nutrition: [55, 12, 8, 3] },
  s2: {
    contains: [],
    complete: true,
    handling: "unknown",
    nutrition: [62, 7, 3, 10],
  },
  s3: { contains: ["milk", "cashews"], complete: true, handling: "shared" },
  c1: { contains: ["sesame"], complete: true, handling: "shared" },
  c2: {
    contains: [],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [46, 4, 1, 5],
  },
  c3: {
    contains: ["sesame"],
    complete: true,
    handling: "unknown",
    nutrition: [39, 9, 0, 10],
  },
  l1: {
    contains: ["soy", "wheat", "sesame"],
    complete: true,
    handling: "shared",
    nutrition: [76, 16, 9, 6],
  },
  l2: { contains: ["soy"], complete: true, handling: "shared" },
  l3: { contains: ["wheat", "egg", "soy"], complete: true, handling: "shared" },
  m1: {
    contains: ["fish", "milk"],
    complete: true,
    handling: "unknown",
    independent: true,
    nutrition: [38, 5, 0, 5],
  },
  m2: {
    contains: ["milk", "wheat", "egg"],
    complete: true,
    handling: "shared",
  },
  m3: { contains: ["wheat"], complete: true, handling: "shared" },
  r1: {
    contains: ["milk"],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [51, 5, 2, 4],
  },
  r2: { contains: ["almonds"], complete: true, handling: "shared" },
  r3: {
    contains: [],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [45, 3, 0, 13],
  },
  t1: {
    contains: [],
    complete: true,
    handling: "documented",
    independent: true,
    nutrition: [40, 8, 0, 10],
  },
  t2: {
    contains: ["milk", "wheat", "egg"],
    complete: true,
    handling: "shared",
  },
  t3: { contains: ["wheat", "walnuts"], complete: true, handling: "shared" },
  h1: { contains: ["milk"], handling: "unknown" },
  h2: { contains: ["fish"], complete: true, handling: "shared" },
  h3: {
    contains: ["egg", "wheat"],
    complete: true,
    handling: "shared",
    nutrition: [59, 19, 12, 4],
  },
  h4: { contains: [], complete: true, handling: "shared" },
  n1: {
    contains: ["soy", "sesame", "peanuts"],
    complete: true,
    handling: "shared",
  },
  n2: {
    contains: ["soy", "wheat", "sesame"],
    complete: true,
    handling: "shared",
  },
  n3: { contains: ["soy"], handling: "unknown" },
  i1: {
    contains: ["wheat"],
    complete: true,
    handling: "shared",
    nutrition: [78, 9, 1, 6],
  },
  i2: { contains: ["shellfish", "milk"], complete: true, handling: "unknown" },
  i3: { contains: ["milk", "wheat"], complete: true, handling: "shared" },
};
export function addFoodNeedFixtures(meal: Meal): Meal {
  const f = fixtures[meal.id];
  if (!f) throw new Error(`Missing food-needs fixture for ${meal.id}`);
  const provenance = f.independent ? "independent" : "reported";
  const allergens = Object.fromEntries(
    (Object.keys(allergenLabels) as Allergen[]).map((key) => {
      const ingredient = f.contains.includes(key)
        ? "contains"
        : f.complete
          ? "absent"
          : "unknown";
      const handling = f.handling ?? "unknown";
      const note =
        handling === "documented"
          ? "Simulated ingredient review, separate preparation area and dedicated equipment are documented for this demo meal. Zero cross-contact risk is not established."
          : handling === "shared"
            ? "Shared kitchen equipment is recorded; allergen-specific cross-contact controls are not confirmed."
            : "No sufficient allergen-specific preparation or cross-contact information is recorded.";
      return [
        key,
        {
          ingredient,
          handling,
          provenance: ingredient === "unknown" ? "unknown" : provenance,
          note,
          date: ingredient === "unknown" ? undefined : "2026-10-20",
        },
      ];
    }),
  ) as Record<Allergen, AllergenRecord>;
  const nutritionFacts: NutritionFacts | undefined = f.nutrition
    ? {
        serving: "one demo main-course portion",
        totalCarbs: f.nutrition[0],
        totalSugars: f.nutrition[1],
        addedSugars: f.nutrition[2],
        fiber: f.nutrition[3],
        provenance,
        date: "2026-10-20",
      }
    : undefined;
  const updated = {
    ...meal,
    allergens,
    nutritionFacts,
    claims: { ...meal.claims },
  };
  // Keep the seed record explicit for inspection; the engine recalculates these claims from structured facts.
  for (const req of Object.keys(requirements) as (keyof typeof requirements)[])
    updated.claims[req] = getRequirementClaim(updated, req);
  if (nutritionFacts)
    updated.claims.nutrition = {
      support: "supported",
      provenance,
      date: "2026-10-20",
      note: "Simulated per-portion total carbohydrate, total sugar, added sugar and fibre values are recorded.",
    };
  return updated;
}
