import { addFoodNeedFixtures } from "./foodNeedFixtures";
import {
  requirements,
  allergenLabels,
  type AllergenRecord,
  type Allergen,
  type Claim,
  type Meal,
  type Requirement,
  type Restaurant,
} from "../types";
export const origins = {
  uw: { name: "University of Waterloo", lat: 43.4723, lng: -80.5449 },
  uptown: { name: "Uptown Waterloo", lat: 43.4653, lng: -80.5221 },
  kitchener: { name: "Downtown Kitchener", lat: 43.4516, lng: -80.4925 },
};
const documented = (note: string): Claim => ({
  support: "supported",
  provenance: "independent",
  note,
  date: "2026-10-02",
});
const reported = (note: string): Claim => ({
  support: "supported",
  provenance: "reported",
  note,
  date: "2026-10-15",
});
const unknown = (note: string): Claim => ({
  support: "unknown",
  provenance: "unknown",
  note,
});
const cert = (kind: string): Claim => ({
  ...documented(
    `Fictional ${kind} documentation covers this meal and its preparation.`,
  ),
  certification: {
    name: `Plateful Demo ${kind} Record (fictional)`,
    expires: "2027-04-01",
  },
});
const veg: Requirement[] = ["vegetarian", "pescatarian"];
const vegan: Requirement[] = [...veg, "vegan"];
function meal(
  id: string,
  name: string,
  description: string,
  price: number,
  tags: Requirement[],
  independent = false,
  extra: Partial<Record<Requirement, Claim>> = {},
  main = true,
): Meal {
  const claims = Object.fromEntries(
    Object.keys(requirements).map((key) => [
      key,
      {
        support: "unsupported",
        provenance: "reported",
        note: "The demo menu record explicitly does not support this requirement.",
        date: "2026-10-15",
      },
    ]),
  ) as Record<Requirement, Claim>;
  claims.certifiedHalal = unknown(
    "No independent halal meat certificate is available for this meal.",
  );
  claims.noAlcohol = unknown(
    "Alcohol use in sauces and preparation has not been confirmed.",
  );
  for (const tag of tags)
    claims[tag] = (independent ? documented : reported)(
      `${name}: ${requirements[tag].toLowerCase()} menu and ingredient information recorded in the demo dataset.`,
    );
  Object.assign(claims, extra);
  return {
    id,
    name,
    description,
    price,
    main,
    claims,
    allergens: Object.fromEntries(
      Object.keys(allergenLabels).map((key) => [
        key,
        {
          ingredient: "unknown",
          handling: "unknown",
          provenance: "unknown",
          note: "No sufficient ingredient or handling information is recorded.",
        },
      ]),
    ) as Record<Allergen, AllergenRecord>,
    nutrition: tags.includes("nutrition")
      ? "Demo portion: 620 kcal · 450 mg sodium"
      : undefined,
    caveat:
      "Gluten-free menu information does not establish celiac-safe preparation. Shared surfaces and cross-contact have not been assessed.",
  };
}
const alcoholFree = documented(
  "Recipe and preparation notes explicitly exclude alcohol, including sauces.",
);
const halalCert = cert("Halal");
const kosherCert = cert("Kosher");
const restaurantsBase: Omit<Restaurant, "address" | "phone">[] = [
  {
    id: "green",
    name: "Green Bowl Kitchen",
    cuisine: "Mediterranean",
    description:
      "Colourful bowls, generous greens, and a little something for everyone.",
    lat: 43.469,
    lng: -80.532,
    price: [20, 40],
    rating: 4.8,
    capacity: 12,
    color: "#dce7c2",
    art: "bowl",
    meals: [
      meal(
        "g1",
        "Roasted garden bowl",
        "Chickpeas, quinoa, roasted squash and lemon tahini.",
        24,
        [...vegan, "halal", "glutenFree", "nutrition", "lowSodium"],
        true,
        { noAlcohol: alcoholFree },
      ),
      meal(
        "g2",
        "Herb falafel plate",
        "Falafel, warm pita, hummus and tomato salad.",
        26,
        [...vegan, "halal"],
        true,
        { noAlcohol: alcoholFree },
      ),
      meal(
        "g3",
        "Grilled halloumi plate",
        "Halloumi, herbed rice and seasonal greens.",
        30,
        [...veg, "glutenFree"],
        true,
      ),
      meal(
        "g4",
        "Lemon lentil stew",
        "Slow-cooked lentils with rice and fresh herbs.",
        22,
        [...vegan, "halal", "glutenFree"],
        true,
      ),
    ],
  },
  {
    id: "saffron",
    name: "Saffron House",
    cuisine: "Indian",
    description:
      "Fragrant curries and family recipes. Ask about preparation details.",
    lat: 43.467,
    lng: -80.519,
    price: [22, 42],
    rating: 4.6,
    capacity: 20,
    color: "#f1d2ad",
    art: "curry",
    meals: [
      meal(
        "s1",
        "Saffron chicken curry",
        "Chicken in a rich tomato and saffron sauce.",
        32,
        ["halal", "glutenFree"],
        false,
        {
          halal: reported(
            "Restaurant reports that its chicken supplier provides halal meat. No independent certificate is available.",
          ),
          noAlcohol: unknown(
            "The kitchen has not confirmed alcohol use in the curry sauce.",
          ),
        },
      ),
      meal(
        "s2",
        "Chana masala",
        "Chickpeas, tomato, coriander and basmati rice.",
        24,
        [...vegan, "halal", "glutenFree"],
        false,
      ),
      meal(
        "s3",
        "Paneer makhani",
        "Paneer in a creamy tomato sauce with rice.",
        28,
        [...veg, "glutenFree"],
        false,
      ),
    ],
  },
  {
    id: "cedar",
    name: "Cedar & Olive",
    cuisine: "Middle Eastern",
    description:
      "A warm table for shared meals, with detailed demo dietary records.",
    lat: 43.459,
    lng: -80.535,
    price: [18, 35],
    rating: 4.9,
    capacity: 24,
    color: "#d4e2cc",
    art: "plate",
    meals: [
      meal(
        "c1",
        "Garden mezze main",
        "A full meal of falafel, lentil rice, hummus and salad.",
        28,
        [...vegan, "halal", "kosher", "glutenFree", "nutrition"],
        true,
        { kosher: kosherCert, noAlcohol: alcoholFree },
      ),
      meal(
        "c2",
        "Charcoal chicken plate",
        "Chicken, lemon rice and grilled vegetables.",
        32,
        ["halal", "glutenFree", "nutrition"],
        true,
        { certifiedHalal: halalCert, halal: halalCert, noAlcohol: alcoholFree },
      ),
      meal(
        "c3",
        "Roasted aubergine main",
        "Tahini aubergine with chickpeas and herbed rice.",
        26,
        [...vegan, "halal", "kosher", "glutenFree", "lowSodium"],
        true,
        { kosher: kosherCert, noAlcohol: alcoholFree },
      ),
    ],
  },
  {
    id: "lotus",
    name: "Lotus Garden",
    cuisine: "Asian Fusion",
    description: "Bright flavours, wok favourites, and plant-forward plates.",
    lat: 43.483,
    lng: -80.558,
    price: [20, 38],
    rating: 4.5,
    capacity: 8,
    color: "#d9e5d2",
    art: "noodles",
    meals: [
      meal(
        "l1",
        "Tofu wheat noodles",
        "Tofu, wheat noodles and a savoury soy glaze.",
        23,
        [...vegan],
        false,
      ),
      meal(
        "l2",
        "Ginger chicken rice",
        "Chicken, rice and ginger with a wheat-free sauce.",
        29,
        ["glutenFree"],
        false,
      ),
      meal(
        "l3",
        "Mushroom dumpling main",
        "A generous plate of wheat dumplings and greens.",
        25,
        [...veg],
        false,
      ),
    ],
  },
  {
    id: "maple",
    name: "Maple Hearth Bistro",
    cuisine: "Canadian",
    description: "Seasonal comfort food in a cosy neighbourhood kitchen.",
    lat: 43.446,
    lng: -80.505,
    price: [25, 45],
    rating: 4.4,
    capacity: 10,
    color: "#e7c9b3",
    art: "plate",
    meals: [
      meal(
        "m1",
        "Roasted salmon",
        "Salmon, potatoes and steamed greens.",
        40,
        ["pescatarian", "glutenFree", "nutrition", "lowSodium"],
        true,
      ),
      meal(
        "m2",
        "Wild mushroom pasta",
        "Wheat pasta, parmesan and a wine cream sauce.",
        32,
        [...veg],
        false,
        {
          noAlcohol: {
            support: "unsupported",
            provenance: "reported",
            note: "Wine is an ingredient in the cream sauce.",
            date: "2026-10-15",
          },
        },
      ),
      meal(
        "m3",
        "Beef and barley pot",
        "Braised beef with barley and root vegetables.",
        38,
        [],
        false,
      ),
    ],
  },
  {
    id: "spice",
    name: "Spice Route Kitchen",
    cuisine: "Indian",
    description: "Vibrant curries with clear ingredient and preparation notes.",
    lat: 43.491,
    lng: -80.552,
    price: [20, 38],
    rating: 4.7,
    capacity: 16,
    color: "#efc89d",
    art: "curry",
    meals: [
      meal(
        "r1",
        "Tandoori chicken rice",
        "Spiced chicken with basmati rice and cucumber.",
        30,
        ["halal", "glutenFree", "nutrition"],
        true,
        { halal: halalCert, certifiedHalal: halalCert, noAlcohol: alcoholFree },
      ),
      meal(
        "r2",
        "Vegetable biryani",
        "Basmati rice, vegetables, saffron and toasted spices.",
        24,
        [...vegan, "halal", "glutenFree"],
        true,
        { noAlcohol: alcoholFree },
      ),
      meal(
        "r3",
        "Dal and rice",
        "Yellow lentils with cumin, turmeric and basmati rice.",
        22,
        [...vegan, "halal", "glutenFree", "lowSodium"],
        true,
        { noAlcohol: alcoholFree },
      ),
    ],
  },
  {
    id: "garden",
    name: "Garden Table Café",
    cuisine: "Vegetarian",
    description:
      "A small, sunny café with thoughtful plant-based main courses.",
    lat: 43.475,
    lng: -80.549,
    price: [15, 28],
    rating: 4.8,
    capacity: 4,
    color: "#e2e6be",
    art: "bowl",
    meals: [
      meal(
        "t1",
        "Harvest quinoa bowl",
        "Quinoa, kale, sweet potato and lemon dressing.",
        22,
        [...vegan, "glutenFree", "lowSodium", "nutrition"],
        true,
        { noAlcohol: alcoholFree },
      ),
      meal(
        "t2",
        "Spinach ricotta pasta",
        "Wheat pasta, spinach and vegetarian ricotta.",
        25,
        [...veg],
        true,
      ),
      meal(
        "t3",
        "Chickpea toast main",
        "Chickpeas and avocado on sourdough with salad.",
        18,
        [...vegan],
        true,
      ),
    ],
  },
  {
    id: "harbor",
    name: "Harbor Street Grill",
    cuisine: "Grill",
    description: "Hearty grilled mains and classic steakhouse sides.",
    lat: 43.425,
    lng: -80.473,
    price: [28, 50],
    rating: 4.3,
    capacity: 30,
    color: "#d9b99a",
    art: "plate",
    meals: [
      meal(
        "h1",
        "Peppercorn steak",
        "Beef steak, potatoes and peppercorn sauce.",
        48,
        [],
        false,
      ),
      meal(
        "h2",
        "Grilled trout",
        "Trout with rice and seasonal vegetables.",
        40,
        ["pescatarian", "glutenFree"],
        false,
      ),
      meal(
        "h3",
        "BBQ chicken platter",
        "Chicken with slaw and fries.",
        36,
        [],
        false,
      ),
      meal(
        "h4",
        "Garden side salad",
        "A small side of mixed greens, not a complete main.",
        9,
        [...vegan, "glutenFree"],
        true,
        {},
        false,
      ),
    ],
  },
  {
    id: "noodle",
    name: "Noodle & Grain",
    cuisine: "Asian",
    description: "Easygoing rice bowls and noodles, made for everyday lunches.",
    lat: 43.447,
    lng: -80.485,
    price: [16, 30],
    rating: 4.6,
    capacity: 14,
    color: "#e6d5b6",
    art: "noodles",
    meals: [
      meal(
        "n1",
        "Sesame tofu rice bowl",
        "Tofu, brown rice and sesame vegetables.",
        22,
        [...vegan, "glutenFree"],
        false,
        {
          glutenFree: {
            support: "partial",
            provenance: "reported",
            note: "Rice and tofu are gluten-free, but the sauce ingredients have not been fully recorded.",
            date: "2026-10-15",
          },
        },
      ),
      meal(
        "n2",
        "Ginger vegetable noodles",
        "Wheat noodles with ginger and greens.",
        20,
        [...vegan],
        false,
      ),
      meal(
        "n3",
        "Chicken rice bowl",
        "Chicken, rice and crunchy pickled vegetables.",
        26,
        ["glutenFree"],
        false,
      ),
    ],
  },
  {
    id: "sunset",
    name: "Sunset Trattoria",
    cuisine: "Italian",
    description: "Handmade classics and leisurely Italian-inspired suppers.",
    lat: 43.403,
    lng: -80.5,
    price: [22, 44],
    rating: 4.7,
    capacity: 18,
    color: "#e9c1a8",
    art: "noodles",
    meals: [
      meal(
        "i1",
        "Pomodoro pasta",
        "Wheat pasta with tomato, basil and olive oil.",
        26,
        [...vegan, "halal"],
        false,
        {
          noAlcohol: reported(
            "Restaurant reports no alcohol in its pomodoro sauce.",
          ),
        },
      ),
      meal(
        "i2",
        "Seafood risotto",
        "Shrimp, arborio rice and a white wine reduction.",
        40,
        ["pescatarian", "glutenFree"],
        false,
        {
          noAlcohol: {
            support: "unsupported",
            provenance: "reported",
            note: "White wine is used in preparation.",
            date: "2026-10-15",
          },
        },
      ),
      meal(
        "i3",
        "Margherita pizza",
        "Wheat crust, mozzarella and fresh basil.",
        28,
        [...veg],
        false,
      ),
    ],
  },
];
export const restaurants: Restaurant[] = restaurantsBase.map((r, i) => ({
  ...r,
  meals: r.meals.map(addFoodNeedFixtures),
  address: `${100 + i * 17} Demo Lane, Waterloo Region (fictional)`,
  phone: `519-555-${String(100 + i).padStart(4, "0")}`,
}));
