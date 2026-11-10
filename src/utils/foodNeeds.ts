import {
  allergyPresets,
  allergenLabels,
  type Claim,
  type Meal,
  type Requirement,
} from "../types";
export const sugarPreferenceLimit = 5;
export const allergyCaveat =
  "Recorded ingredients and handling notes are not an allergy-safety guarantee. Confirm ingredients and cross-contact precautions directly with the restaurant.";
export const sugarCaveat =
  "Sugar-conscious is a demo preference of at most 5 g added sugar per recorded main-course portion, with total carbohydrate information available. It is not a diabetes-suitability assessment; carbohydrate needs are individual.";
export function getRequirementClaim(
  meal: Meal,
  requirement: Requirement,
): Claim {
  const preset = allergyPresets.find((p) => p.key === requirement);
  if (preset) {
    const records = preset.allergens.map((key) => ({
      key,
      ...meal.allergens[key],
    }));
    const contains = records.filter((r) => r.ingredient === "contains");
    const unknown = records.filter((r) => r.ingredient === "unknown");
    const incompleteHandling = records.filter(
      (r) => r.handling !== "documented",
    );
    const provenance = records.every((r) => r.provenance === "independent")
      ? "independent"
      : records.some((r) => r.provenance === "unknown")
        ? "unknown"
        : "reported";
    const date = records.every((r) => r.date === records[0].date)
      ? records[0].date
      : undefined;
    if (contains.length)
      return {
        support: "unsupported",
        provenance,
        date,
        note: `Recorded ingredients contain ${contains.map((r) => allergenLabels[r.key].toLowerCase()).join(", ")}. This meal does not meet the selected avoidance requirement.`,
      };
    if (unknown.length)
      return {
        support: "unknown",
        provenance,
        date,
        note: `Ingredient information is unknown for ${unknown.map((r) => allergenLabels[r.key].toLowerCase()).join(", ")}. Absence cannot be assumed.`,
      };
    if (incompleteHandling.length)
      return {
        support: "partial",
        provenance,
        date,
        note: "The recorded recipe excludes the selected allergen(s), but cross-contact handling is shared or unconfirmed. Flexible results are possibilities to investigate, not confirmed allergy matches.",
      };
    return {
      support: "supported",
      provenance,
      date,
      note: "The recorded recipe excludes the selected allergen(s), and simulated dedicated-equipment and preparation procedures are documented. This supports a prototype information match, not a guarantee of zero cross-contact.",
    };
  }
  if (requirement === "eggFree") {
    const r = meal.allergens.egg;
    return {
      support:
        r.ingredient === "absent"
          ? "supported"
          : r.ingredient === "contains"
            ? "unsupported"
            : "unknown",
      provenance: r.provenance,
      date: r.date,
      note:
        r.ingredient === "absent"
          ? "The recorded recipe contains no egg ingredients. This dietary preference does not evaluate allergy cross-contact; use the Egg allergy preset for handling evidence."
          : r.ingredient === "contains"
            ? "Egg is present in the recorded recipe."
            : "Egg ingredient information has not been confirmed.",
    };
  }
  if (requirement === "sugarConscious") {
    const n = meal.nutritionFacts;
    if (
      !n ||
      ![n.addedSugars, n.totalCarbs, n.totalSugars, n.fiber].every(
        (v) => Number.isFinite(v) && v >= 0,
      ) ||
      n.addedSugars > n.totalSugars ||
      n.totalSugars > n.totalCarbs ||
      n.fiber > n.totalCarbs ||
      n.provenance === "unknown"
    )
      return {
        support: "unknown",
        provenance: "unknown",
        note: "No sufficient per-portion added-sugar and total-carbohydrate information is recorded.",
      };
    return {
      support:
        n.addedSugars <= sugarPreferenceLimit ? "supported" : "unsupported",
      provenance: n.provenance,
      date: n.date,
      note: `Per ${n.serving}: ${n.addedSugars} g added sugar, ${n.totalSugars} g total sugar and ${n.totalCarbs} g total carbohydrate. ${n.addedSugars <= sugarPreferenceLimit ? "Meets" : "Exceeds"} the demo added-sugar preference of ${sugarPreferenceLimit} g or less. Not a personalized diabetes recommendation.`,
    };
  }
  return meal.claims[requirement];
}
