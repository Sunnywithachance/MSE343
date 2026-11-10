export const requirements = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  halal: "Halal",
  kosher: "Kosher",
  glutenFree: "Gluten-free options",
  lowSodium: "Lower sodium",
  nutrition: "Nutrition information",
  certifiedHalal: "Certified halal meat",
  noAlcohol: "No alcohol in meal preparation",
  eggFree: "Egg-free ingredients",
  sugarConscious: "Sugar-conscious",
  avoidSesame: "Avoid sesame",
  avoidPeanuts: "Avoid peanuts",
  avoidWalnuts: "Avoid walnuts",
  avoidAlmonds: "Avoid almonds",
  avoidCashews: "Avoid cashews",
  avoidTreeNuts: "Avoid all tree nuts",
  avoidAllNuts: "Avoid all nuts",
  avoidEgg: "Egg allergy",
  avoidMilk: "Milk allergy",
  avoidSoy: "Soy allergy",
  avoidWheat: "Wheat allergy",
  avoidFish: "Fish allergy",
  avoidShellfish: "Shellfish allergy",
} as const;
export type Requirement = keyof typeof requirements;
export type Support = "supported" | "partial" | "unknown" | "unsupported";
export type Provenance = "independent" | "reported" | "unknown";
export interface Claim {
  support: Support;
  provenance: Provenance;
  note: string;
  date?: string;
  certification?: { name: string; expires: string };
}
export const allergenLabels = {
  sesame: "Sesame",
  peanuts: "Peanuts",
  walnuts: "Walnuts",
  almonds: "Almonds",
  cashews: "Cashews",
  otherTreeNuts: "Other tree nuts",
  egg: "Egg",
  milk: "Milk",
  soy: "Soy",
  wheat: "Wheat",
  fish: "Fish",
  shellfish: "Shellfish",
} as const;
export type Allergen = keyof typeof allergenLabels;
export const allergyPresets: {
  key: Requirement;
  label: string;
  allergens: Allergen[];
}[] = [
  { key: "avoidSesame", label: "Sesame", allergens: ["sesame"] },
  { key: "avoidPeanuts", label: "Peanuts", allergens: ["peanuts"] },
  { key: "avoidWalnuts", label: "Walnuts", allergens: ["walnuts"] },
  {
    key: "avoidAllNuts",
    label: "All nuts",
    allergens: ["peanuts", "walnuts", "almonds", "cashews", "otherTreeNuts"],
  },
  { key: "avoidAlmonds", label: "Almonds", allergens: ["almonds"] },
  { key: "avoidCashews", label: "Cashews", allergens: ["cashews"] },
  {
    key: "avoidTreeNuts",
    label: "All tree nuts",
    allergens: ["walnuts", "almonds", "cashews", "otherTreeNuts"],
  },
  { key: "avoidEgg", label: "Egg", allergens: ["egg"] },
  { key: "avoidMilk", label: "Milk", allergens: ["milk"] },
  { key: "avoidSoy", label: "Soy", allergens: ["soy"] },
  { key: "avoidWheat", label: "Wheat", allergens: ["wheat"] },
  { key: "avoidFish", label: "Fish", allergens: ["fish"] },
  { key: "avoidShellfish", label: "Shellfish", allergens: ["shellfish"] },
];
export function isAllergyRequirement(key: Requirement) {
  return allergyPresets.some((p) => p.key === key);
}
export interface AllergenRecord {
  ingredient: "contains" | "absent" | "unknown";
  handling: "documented" | "shared" | "unknown";
  provenance: Provenance;
  note: string;
  date?: string;
}
export interface NutritionFacts {
  serving: string;
  totalCarbs: number;
  totalSugars: number;
  addedSugars: number;
  fiber: number;
  provenance: Provenance;
  date: string;
}
export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  main: boolean;
  claims: Record<Requirement, Claim>;
  nutrition?: string;
  nutritionFacts?: NutritionFacts;
  allergens: Record<Allergen, AllergenRecord>;
  caveat: string;
}
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  lat: number;
  lng: number;
  price: [number, number];
  rating: number;
  capacity: number;
  address: string;
  phone: string;
  meals: Meal[];
  color: string;
  art: string;
}
export interface Diner {
  label: string;
  requirements: Requirement[];
}
export interface Profile {
  requirements: Requirement[];
  strict: boolean;
  independent: boolean;
}
export type Origin = "uw" | "uptown" | "kitchener";
export interface Filters extends Profile {
  mode: "personal" | "group";
  diners: Diner[];
  origin: Origin;
  radius: number;
  query: string;
  sort: "nearest" | "price" | "match";
}
export interface RequirementResult {
  requirement: Requirement;
  support: Support;
  claim: Claim;
}
export interface DinerMatch {
  diner: Diner;
  status: "full" | "partial" | "none";
  meals: Meal[];
  bestMeal?: Meal;
  requirements: RequirementResult[];
  supported: number;
}
export interface Result {
  restaurant: Restaurant;
  distance: number;
  status: "full" | "partial" | "none";
  diners: DinerMatch[];
  supported: number;
  total: number;
  estimate: number;
  reasons: string[];
}
