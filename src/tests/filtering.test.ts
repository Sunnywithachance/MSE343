import { beforeEach, describe, expect, it } from "vitest";
import { restaurants, origins } from "../data/restaurants";
import { requirements, type Filters, type Restaurant } from "../types";
import {
  applyProfile,
  defaultFilters,
  distanceKm,
  effectiveSupport,
  evaluateDiner,
  evaluateRestaurant,
  filterRestaurants,
  groupCost,
  profileFromFilters,
  validateFilters,
} from "../utils/engine";
import {
  loadShortlist,
  saveShortlist,
  loadProfile,
  writeStored,
} from "../utils/storage";
const byId = (id: string) => restaurants.find((r) => r.id === id)!;
const base = (patch: Partial<Filters> = {}): Filters => ({
  ...defaultFilters(),
  radius: 20,
  ...patch,
});
const ids = (f: Filters) =>
  filterRestaurants(restaurants, f).map((r) => r.restaurant.id);
const betty = (): Filters =>
  base({
    mode: "group",
    radius: 5,
    diners: [
      { label: "Vegetarian colleague", requirements: ["vegetarian"] },
      { label: "Kosher colleague", requirements: ["kosher"] },
      { label: "Gluten-free colleague", requirements: ["glutenFree"] },
      ...Array.from({ length: 3 }, (_, i) => ({
        label: `Person ${i + 4}`,
        requirements: [],
      })),
    ],
  });
describe("structured dataset", () => {
  it("has exactly ten unique fictional restaurants and 3–6 menu entries each", () => {
    expect(restaurants).toHaveLength(10);
    expect(new Set(restaurants.map((r) => r.id)).size).toBe(10);
    for (const r of restaurants) {
      expect(r.meals.length).toBeGreaterThanOrEqual(3);
      expect(r.meals.length).toBeLessThanOrEqual(6);
      expect(r.capacity).toBeGreaterThan(0);
      expect(r.phone).toContain("555");
      expect(r.price[0]).toBeLessThanOrEqual(r.price[1]);
      for (const m of r.meals) {
        expect(Object.keys(m.claims).sort()).toEqual(
          Object.keys(requirements).sort(),
        );
        expect(m.price).toBeGreaterThan(0);
        if (m.main) {
          expect(m.price).toBeGreaterThanOrEqual(r.price[0]);
          expect(m.price).toBeLessThanOrEqual(r.price[1]);
        }
      }
    }
  });
  it("never uses a side dish to satisfy main-course requirements", () => {
    expect(
      evaluateDiner(
        byId("harbor"),
        { label: "Me", requirements: ["vegetarian"] },
        false,
      ).status,
    ).toBe("none");
  });
});
describe("personal matching", () => {
  it("shows all ten restaurants without restrictive filters", () =>
    expect(ids(base())).toHaveLength(10));
  it("filters for one diet", () => {
    const found = ids(base({ requirements: ["vegetarian"] }));
    expect(found).toContain("green");
    expect(found).not.toContain("harbor");
  });
  it("finds multiple vegetarian + halal meals", () => {
    expect(
      ids(base({ requirements: ["vegetarian", "halal"] })).length,
    ).toBeGreaterThanOrEqual(3);
  });
  it("requires all personal needs on ONE main course", () => {
    const r = byId("lotus");
    expect(
      evaluateDiner(r, { label: "Me", requirements: ["vegetarian"] }, false)
        .status,
    ).toBe("full");
    expect(
      evaluateDiner(r, { label: "Me", requirements: ["glutenFree"] }, false)
        .status,
    ).toBe("full");
    expect(
      evaluateDiner(
        r,
        { label: "Me", requirements: ["vegetarian", "glutenFree"] },
        false,
      ).status,
    ).toBe("none");
  });
  it("excludes incomplete evidence in Strict and includes it in Flexible", () => {
    const f = base({ requirements: ["halal", "certifiedHalal", "noAlcohol"] });
    expect(ids(f)).not.toContain("saffron");
    expect(ids({ ...f, strict: false })).toContain("saffron");
    expect(evaluateRestaurant(byId("saffron"), f).status).toBe("partial");
    expect(ids(f)).toContain("cedar");
    expect(ids(f)).toContain("spice");
  });
  it("never treats unknown evidence as full support", () => {
    const result = evaluateRestaurant(
      byId("saffron"),
      base({ requirements: ["certifiedHalal"] }),
    );
    expect(result.status).toBe("partial");
    expect(result.supported).toBe(0);
  });
  it("distinguishes reported from independently documented", () => {
    expect(ids(base({ requirements: ["halal"] }))).toContain("saffron");
    expect(
      ids(base({ requirements: ["halal"], independent: true })),
    ).not.toContain("saffron");
  });
  it("does not treat self-reported halal chicken as independent certification", () => {
    const m = byId("saffron").meals[0];
    expect(m.claims.halal.provenance).toBe("reported");
    expect(effectiveSupport(m, "certifiedHalal", true)).toBe("unknown");
    expect(
      evaluateDiner(
        byId("saffron"),
        { label: "Yousuf", requirements: ["halal", "certifiedHalal"] },
        true,
      ).status,
    ).not.toBe("full");
  });
  it("requires actual independent certificate data for certified halal", () => {
    const restaurant = structuredClone(byId("saffron"));
    restaurant.meals[0].claims.certifiedHalal = {
      support: "supported",
      provenance: "reported",
      note: "Claims certification without document",
    };
    expect(effectiveSupport(restaurant.meals[0], "certifiedHalal", false)).toBe(
      "unknown",
    );
  });
  it("shows partial menu information only as unconfirmed", () => {
    const f = base({ requirements: ["vegan", "glutenFree"] });
    expect(ids(f)).not.toContain("noodle");
    expect(ids({ ...f, strict: false })).toContain("noodle");
  });
  it("does not soften affirmative unsupported requirements in Flexible", () => {
    expect(
      ids(base({ requirements: ["kosher"], strict: false })),
    ).not.toContain("harbor");
  });
});
describe("group matching and costs", () => {
  it("supports Betty’s six-person lunch within 5 km", () => {
    const found = filterRestaurants(restaurants, betty());
    expect(found.map((r) => r.restaurant.id)).toContain("cedar");
    const cedar = found.find((r) => r.restaurant.id === "cedar")!;
    expect(cedar.status).toBe("full");
    expect(cedar.diners).toHaveLength(6);
    expect(cedar.estimate).toBe(210);
  });
  it("allows different dishes for different people instead of one dish for everyone", () => {
    const f = base({
      mode: "group",
      diners: [
        { label: "A", requirements: ["vegetarian"] },
        { label: "B", requirements: ["glutenFree"] },
      ],
    });
    expect(ids(f)).toContain("lotus");
    const found = evaluateRestaurant(byId("lotus"), f);
    expect(found.diners[0].bestMeal?.id).not.toBe(found.diners[1].bestMeal?.id);
  });
  it("enforces capacity independently from dietary suitability", () => {
    const f = betty();
    f.diners.forEach((d) => (d.requirements = []));
    expect(ids(f)).not.toContain("garden");
    expect(evaluateRestaurant(byId("garden"), f).reasons).toContain(
      "Group exceeds stated capacity",
    );
  });
  it("uses the conservative price upper bound times party size", () =>
    expect(groupCost(byId("cedar"), 6)).toBe(210));
  it("does not exclude restaurants based on their price", () => {
    const expensive = structuredClone(byId("green"));
    expensive.price = [200, 500];
    expect(
      filterRestaurants([expensive], base()).map((r) => r.restaurant.id),
    ).toEqual(["green"]);
    const group = {
      ...betty(),
      diners: betty().diners.map((d) => ({ ...d, requirements: [] })),
    };
    expect(filterRestaurants([expensive], group)).toHaveLength(1);
  });
});
describe("geography, search and sorting", () => {
  it("calculates deterministic Haversine distances", () => {
    expect(distanceKm(origins.uw, origins.uw)).toBe(0);
    expect(distanceKm(origins.uw, origins.kitchener)).toBeCloseTo(4.83, 1);
    expect(distanceKm(origins.uw, origins.kitchener)).toBe(
      distanceKm(origins.kitchener, origins.uw),
    );
  });
  it("excludes several restaurants when radius drops from 10 to 3 km", () => {
    expect(
      ids(base({ radius: 10 })).length - ids(base({ radius: 3 })).length,
    ).toBeGreaterThanOrEqual(3);
  });
  it("recalculates distances and membership when origin changes", () => {
    const f = base({ radius: 3 });
    expect(ids(f)).not.toContain("noodle");
    expect(ids({ ...f, origin: "kitchener" })).toContain("noodle");
    expect(evaluateRestaurant(byId("green"), f).distance).not.toBe(
      evaluateRestaurant(byId("green"), { ...f, origin: "kitchener" }).distance,
    );
  });
  it("combines dietary filters and matching menu text", () => {
    const f = base({ query: "pasta", requirements: ["vegetarian"] });
    expect(ids(f)).toContain("sunset");
    expect(ids(f)).toContain("garden");
    expect(ids(f)).not.toContain("harbor");
  });
  it("does not use an incompatible dish to satisfy a text search", () => {
    const r = structuredClone(byId("lotus"));
    r.meals[1].name = "Chicken pasta";
    expect(
      filterRestaurants(
        [r],
        base({ query: "pasta", requirements: ["vegetarian"] }),
      ),
    ).toHaveLength(0);
  });
  it("supports restaurant and cuisine queries", () => {
    expect(ids(base({ query: "Saffron House" }))).toEqual(["saffron"]);
    expect(ids(base({ query: "Italian" }))).toEqual(["sunset"]);
  });
  it("has an understandable zero-results combination", () =>
    expect(
      ids(
        base({
          requirements: ["kosher", "certifiedHalal", "vegan"],
          radius: 1,
        }),
      ),
    ).toHaveLength(0));
  it("sorts by nearest and price deterministically", () => {
    const nearest = filterRestaurants(restaurants, base());
    expect(nearest[0].restaurant.id).toBe("garden");
    const price = filterRestaurants(restaurants, base({ sort: "price" }));
    expect(price[0].restaurant.id).toBe("garden");
    for (let i = 1; i < price.length; i++)
      expect(price[i].restaurant.price[1]).toBeGreaterThanOrEqual(
        price[i - 1].restaurant.price[1],
      );
  });
  it("places full matches before uncertain matches in Flexible mode", () => {
    const found = filterRestaurants(
      restaurants,
      base({
        requirements: ["halal", "certifiedHalal"],
        strict: false,
        sort: "price",
      }),
    );
    const firstPartial = found.findIndex((r) => r.status === "partial");
    expect(firstPartial).toBeGreaterThan(0);
    expect(found.slice(firstPartial).every((r) => r.status === "partial")).toBe(
      true,
    );
  });
});
describe("state, validation and persistence", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    });
  });
  it("resets to documented defaults without sharing mutable arrays", () => {
    const a = defaultFilters();
    a.requirements.push("vegan");
    expect(defaultFilters().requirements).toEqual([]);
    expect(defaultFilters().radius).toBe(5);
    expect(defaultFilters().diners).toHaveLength(6);
  });
  it("keeps saved profile distinct from temporary and group needs", () => {
    const p = {
      requirements: ["vegan"] as const,
      strict: true,
      independent: false,
    };
    const profile = { ...p, requirements: [...p.requirements] };
    const applied = applyProfile(defaultFilters(), profile);
    applied.requirements.push("halal");
    expect(profile.requirements).toEqual(["vegan"]);
    const group = betty();
    expect(profileFromFilters(group).requirements).toEqual([]);
  });
  it("persists shortlist entries and removals", () => {
    saveShortlist(["cedar", "spice"]);
    expect(loadShortlist()).toEqual(["cedar", "spice"]);
    saveShortlist(["cedar"]);
    expect(loadShortlist()).toEqual(["cedar"]);
  });
  it("persists only explicit profile saves", () => {
    writeStored("profile", {
      requirements: ["halal"],
      strict: false,
      independent: false,
    });
    const f = defaultFilters();
    f.requirements = ["kosher"];
    expect(loadProfile().requirements).toEqual(["halal"]);
  });
  it("recovers from malformed local storage", () => {
    localStorage.setItem("dare-shortlist", "broken JSON");
    expect(loadShortlist()).toEqual([]);
  });
  it("prevents zero-person groups and out-of-range distances", () => {
    expect(validateFilters(base({ mode: "group", diners: [] }))).toBeTruthy();
    expect(validateFilters(base({ radius: 0 }))).toBeTruthy();
    expect(validateFilters(base({ radius: 21 }))).toBeTruthy();
    expect(validateFilters(betty())).toBeNull();
  });
  it("does not mutate applied filters while editing a draft", () => {
    const applied = betty();
    const draft = structuredClone(applied);
    draft.diners[0].requirements.push("vegan");
    draft.radius = 1;
    expect(applied.radius).toBe(5);
    expect(applied.diners[0].requirements).toEqual(["vegetarian"]);
  });
});
