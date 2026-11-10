import { describe, expect, it } from "vitest";
import { restaurants } from "../data/restaurants";
import {
  allergenLabels,
  allergyPresets,
  type Meal,
  type Requirement,
  type Restaurant,
} from "../types";
import { getRequirementClaim } from "../utils/foodNeeds";
import {
  defaultFilters,
  effectiveSupport,
  evaluateDiner,
  filterRestaurants,
  profileFromFilters,
  applyProfile,
} from "../utils/engine";
const meal = (id: string) =>
  restaurants.flatMap((r) => r.meals).find((m) => m.id === id)!;
const venue = (m: Meal): Restaurant => ({ ...restaurants[0], meals: [m] });
const matches = (req: Requirement[], strict = true) =>
  filterRestaurants(restaurants, {
    ...defaultFilters(),
    radius: 20,
    requirements: req,
    strict,
  });
describe("allergy fixtures and matching", () => {
  it("records every allergen separately for every meal without inferring absence", () => {
    for (const r of restaurants)
      for (const m of r.meals)
        expect(Object.keys(m.allergens).sort()).toEqual(
          Object.keys(allergenLabels).sort(),
        );
    expect(meal("s1").allergens.peanuts.ingredient).toBe("unknown");
  });
  it("includes sesame, peanuts, walnuts, all nuts and egg among the presets", () => {
    for (const key of [
      "avoidSesame",
      "avoidPeanuts",
      "avoidWalnuts",
      "avoidAllNuts",
      "avoidEgg",
    ])
      expect(allergyPresets.map((p) => p.key)).toContain(key);
  });
  it("excludes a known sesame ingredient even in Flexible mode", () => {
    expect(getRequirementClaim(meal("g1"), "avoidSesame").support).toBe(
      "unsupported",
    );
    expect(
      filterRestaurants([venue(meal("g1"))], {
        ...defaultFilters(),
        requirements: ["avoidSesame"],
        strict: false,
      }),
    ).toHaveLength(0);
  });
  it("allows strict ingredient-and-handling information matches with explicit fictional documentation", () => {
    expect(getRequirementClaim(meal("g4"), "avoidSesame").support).toBe(
      "supported",
    );
    expect(matches(["avoidSesame"]).map((r) => r.restaurant.id)).toContain(
      "green",
    );
  });
  it("keeps absent ingredients with shared equipment partial, not fully supported", () => {
    expect(getRequirementClaim(meal("l2"), "avoidPeanuts").support).toBe(
      "partial",
    );
    expect(
      evaluateDiner(
        venue(meal("l2")),
        { label: "Me", requirements: ["avoidPeanuts"] },
        false,
      ).status,
    ).toBe("partial");
  });
  it("keeps missing ingredient information unknown", () =>
    expect(getRequirementClaim(meal("s1"), "avoidAllNuts").support).toBe(
      "unknown",
    ));
  it("includes uncertain handling in Flexible but excludes it in Strict", () => {
    const f = {
      ...defaultFilters(),
      requirements: ["avoidPeanuts"] as Requirement[],
    };
    expect(filterRestaurants([venue(meal("l2"))], f)).toHaveLength(0);
    expect(
      filterRestaurants([venue(meal("l2"))], { ...f, strict: false }),
    ).toHaveLength(1);
  });
  it("all nuts covers peanuts, walnuts, almonds, cashews and other tree nuts", () => {
    for (const id of ["n1", "t3", "r2", "s3"])
      expect(getRequirementClaim(meal(id), "avoidAllNuts").support).toBe(
        "unsupported",
      );
    const other = structuredClone(meal("g4"));
    other.allergens.otherTreeNuts.ingredient = "contains";
    expect(getRequirementClaim(other, "avoidAllNuts").support).toBe(
      "unsupported",
    );
  });
  it("does not merge sesame with all nuts", () =>
    expect(getRequirementClaim(meal("g1"), "avoidAllNuts").support).toBe(
      "supported",
    ));
  it("does not assume peanut avoidance excludes tree nuts or vice versa", () => {
    const m = structuredClone(meal("g4"));
    m.allergens.walnuts.ingredient = "contains";
    expect(getRequirementClaim(m, "avoidPeanuts").support).toBe("supported");
    expect(getRequirementClaim(m, "avoidTreeNuts").support).toBe("unsupported");
  });
  it("combines multiple allergies with diet requirements on the same meal", () => {
    const d = {
      label: "Me",
      requirements: [
        "vegetarian",
        "avoidAllNuts",
        "avoidSesame",
        "eggFree",
      ] as Requirement[],
    };
    expect(
      evaluateDiner(
        restaurants.find((r) => r.id === "green")!,
        d,
        false,
      ).meals.map((m) => m.id),
    ).toEqual(["g4"]);
  });
  it("allows different group members to have different allergy needs", () => {
    const second = structuredClone(meal("g4"));
    second.allergens.walnuts.ingredient = "contains";
    const r = venue(meal("g1"));
    r.meals.push(second);
    const f = {
      ...defaultFilters(),
      mode: "group" as const,
      diners: [
        {
          label: "Sesame avoidance",
          requirements: ["avoidSesame"] as Requirement[],
        },
        {
          label: "Walnut avoidance",
          requirements: ["avoidWalnuts"] as Requirement[],
        },
      ],
    };
    const found = filterRestaurants([r], f);
    expect(found).toHaveLength(1);
    expect(found[0].diners[0].bestMeal?.id).toBe("g4");
    expect(found[0].diners[1].bestMeal?.id).toBe("g1");
    expect(
      evaluateDiner(
        r,
        { label: "One diner", requirements: ["avoidSesame", "avoidWalnuts"] },
        false,
      ).status,
    ).toBe("none");
  });
  it("applies independent-evidence policy to ingredient and handling claims", () => {
    const m = structuredClone(meal("g4"));
    m.allergens.peanuts.provenance = "reported";
    expect(effectiveSupport(m, "avoidPeanuts", false)).toBe("supported");
    expect(effectiveSupport(m, "avoidPeanuts", true)).toBe("unknown");
  });
  it("separates egg-free dietary ingredients from egg-allergy handling", () => {
    expect(getRequirementClaim(meal("l2"), "eggFree").support).toBe(
      "supported",
    );
    expect(getRequirementClaim(meal("l2"), "avoidEgg").support).toBe("partial");
    expect(getRequirementClaim(meal("l3"), "eggFree").support).toBe(
      "unsupported",
    );
  });
  it("saves allergies and new dietary needs without mutating profile during a search", () => {
    const f = {
      ...defaultFilters(),
      requirements: [
        "avoidSesame",
        "eggFree",
        "sugarConscious",
      ] as Requirement[],
    };
    const p = profileFromFilters(f);
    const search = applyProfile(defaultFilters(), p);
    search.requirements = [];
    expect(p.requirements).toEqual(f.requirements);
  });
});
describe("sugar-conscious nutrition evidence", () => {
  it("requires recorded added sugar AND total carbohydrate information", () => {
    expect(getRequirementClaim(meal("g4"), "sugarConscious").support).toBe(
      "supported",
    );
    expect(getRequirementClaim(meal("g2"), "sugarConscious").support).toBe(
      "unknown",
    );
  });
  it("keeps incomplete per-portion carbohydrate data unknown", () => {
    const m = structuredClone(meal("g4"));
    delete (m.nutritionFacts as Partial<NonNullable<Meal["nutritionFacts"]>>)
      .totalCarbs;
    expect(getRequirementClaim(m, "sugarConscious").support).toBe("unknown");
  });
  it("uses an explicit demo preference and excludes meals above it even in Flexible", () => {
    expect(getRequirementClaim(meal("h3"), "sugarConscious").support).toBe(
      "unsupported",
    );
    expect(
      filterRestaurants([venue(meal("h3"))], {
        ...defaultFilters(),
        radius: 20,
        requirements: ["sugarConscious"],
        strict: false,
      }),
    ).toHaveLength(0);
  });
  it("accepts the boundary of 5 g and rejects values above it", () => {
    const m = structuredClone(meal("g4"));
    m.nutritionFacts!.totalSugars = 6;
    m.nutritionFacts!.addedSugars = 5;
    expect(getRequirementClaim(m, "sugarConscious").support).toBe("supported");
    m.nutritionFacts!.addedSugars = 6;
    expect(getRequirementClaim(m, "sugarConscious").support).toBe(
      "unsupported",
    );
  });
  it("never presents missing nutrition as supported in Strict", () => {
    const r = venue(meal("g2"));
    const f = {
      ...defaultFilters(),
      requirements: ["sugarConscious"] as Requirement[],
    };
    expect(filterRestaurants([r], f)).toHaveLength(0);
    expect(filterRestaurants([r], { ...f, strict: false })).toHaveLength(1);
  });
  it("combines sugar-conscious and allergy requirements with useful results", () =>
    expect(
      matches(["sugarConscious", "avoidAllNuts", "avoidSesame", "eggFree"])
        .length,
    ).toBeGreaterThanOrEqual(3));
  it("provides internally consistent simulated nutrition facts", () => {
    for (const r of restaurants)
      for (const m of r.meals) {
        const n = m.nutritionFacts;
        if (!n) continue;
        expect(n.addedSugars).toBeLessThanOrEqual(n.totalSugars);
        expect(n.totalSugars).toBeLessThanOrEqual(n.totalCarbs);
        expect(n.fiber).toBeLessThanOrEqual(n.totalCarbs);
        expect(n.addedSugars).toBeGreaterThanOrEqual(0);
      }
  });
});
