# Plateful — Dietary-aware restaurant explorer

MSE 343 Milestone 3 · Group 19 — Mouseketeers

A mobile-first interactive horizontal prototype for finding restaurants that accommodate personal or group dietary needs. Built with React, TypeScript, Vite, Tailwind CSS and Lucide React. Pure TypeScript matching functions are tested with Vitest. No backend, account, API key or location permission is needed.

## Run locally

Use Node.js 20.19+ (Node 22 LTS is also suitable).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173. To test on a phone on the same Wi-Fi, use the Network URL printed by `npm run dev`; your computer may ask you to allow local network access.

```sh
npm test          # core logic and persistence tests
npm run build    # TypeScript check and production bundle in dist/
npm run preview  # serve that production bundle locally
```

## Functional scope

The primary workflow is complete: discover → search → edit draft filters → choose personal or group needs → set evidence policy, strictness, origin and distance → apply → inspect computed results and corresponding map markers → open a restaurant → inspect meal compatibility and expandable dietary evidence → return and revise filters.

The six requested screen states are represented by the dietary profile panel, discovery/map screen, search suggestions, filter drawer, restaurant summary and dietary evidence section. The map uses local SVG with selectable restaurant markers. On small screens filters are a bottom sheet; on desktop they are a side dialog. Native modal dialogs contain keyboard focus, close with Escape and restore focus on exit.

Supporting interactions include removable filter chips, three sorts, recent searches, an explicit saved profile, diner labels, a persistent shortlist with comparison information, browser sharing and clipboard/manual-copy fallbacks, and a fictional contact-information disclosure.

The app starts in discovery. Open **My profile** to save personal preferences; profile setup is optional. Saved preferences initialize future visits. Temporary filters do not change them. Filter edits are drafts: Apply commits; Close/Escape discards. **Reset** restores the documented defaults in the draft; Apply then commits them. **Reset all** in discovery resets the active search immediately. Neither reset changes the saved profile. Saving preferences is disabled in group mode so another diner's needs cannot overwrite your personal profile.

## Matching rules and demo data

Exactly ten fictional restaurants live in `src/data/restaurants.ts`, with three to six menu items each. The data includes main-versus-side distinction, explicit per-meal support and provenance, ingredients, preparation notes, prices, capacity, coordinates, dates, and fictional certification records. No dietary suitability is inferred from ingredient keywords.

`src/utils/engine.ts` contains the pure matching, filtering, validation, distance and cost functions:

- **Personal:** at least one main course must satisfy every selected requirement together. Separate vegetarian and gluten-free dishes cannot satisfy one person's combined requirements.
- **Group:** each diner is evaluated separately. Different meals can accommodate different people. Capacity must cover the whole party, including people without restrictions.
- **Support:** supported, partially supported, unknown and unsupported are separate from provenance (independently documented, restaurant-reported, unknown) and search match (full, partial, no match).
- **Strict:** only full matches qualify under the chosen evidence policy. **Flexible:** adds uncertain possibilities after full matches. Affirmatively unsupported requirements and failed hard constraints never qualify, even in Flexible mode.
- **Independent-only policy:** self-reported support becomes unresolved for search matching. Certified halal meat additionally requires a fictional independent certificate record. A halal dish claim is insufficient.
- **Search:** restaurant and cuisine text match the establishment; menu text must match a main-course option compatible with the selected requirements. Query, distance, capacity and evidence constraints work together. All filtering is computed from records, with no scenario-specific result lists.
- **Distance:** deterministic Haversine distance from University of Waterloo, Uptown Waterloo or Downtown Kitchener. Changing origin recalculates distances; display rounds to 0.1 km, filtering uses the unrounded value. Map geography is schematic and distances are straight-line, not driving distances.
- **Cost:** conservative estimated menu cost = top of restaurant price range × number of diners. Prices are informational only and never exclude restaurants. The summary also shows the restaurant's range × party size. This is a venue-level estimate, not a quote for a selected meal. Tax, gratuity, drinks and extras are excluded. Estimates do not establish suitable meals where evidence is unresolved.
- **Defaults:** personal mode, no requirements, restaurant-reported evidence accepted, Strict, University of Waterloo, 5 km, nearest first. A new group draft starts with six diners. An unrestricted 20 km search displays all ten records.

For compatibility with earlier prototype sessions, the internal storage keys retain the `dare-` prefix. LocalStorage stores only explicitly saved personal preferences (`dare-profile`), shortlist IDs (`dare-shortlist`) and up to five recent searches (`dare-recent`). No personal identity is collected. Search results and filters remain in React state during navigation. If storage is unavailable, the app remains usable for the session and displays feedback.

## Milestone 2 improvements

| Walkthrough issue                 | Implemented response                                                          |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Profile assumes one diner         | Personal/group switch; separate needs and labels for each diner               |
| Missing office location/budget    | Three selectable demo origins and distance controls; budget filtering removed |
| No group cost/capacity            | Party size, stated capacity checks, conservative menu estimates               |
| Unclear information sources       | Per-meal provenance, source notes and cross-contact caveats                   |
| Cannot share a shortlist          | Persistent shortlist, share API, clipboard and selectable text fallback       |
| Unclear strict/flexible           | Explanations beside controls; full and uncertain result groups                |
| Ambiguous match symbols           | Plain-language legend and text paired with symbols                            |
| Evidence area hard to discover    | Prominent evidence action, clickable accordion headers and chevrons           |
| Certification looks self-reported | Distinct provenance labels; fictional certificates and dates                  |
| No clarification action           | Clearly labeled fictional contact-information panel                           |

**Reference limitation:** The supplied implementation brief contains the six-screen descriptions and ten walkthrough findings, which this implementation follows. The original Milestone 1 report, Milestone 2 report and Appendix B sketch were not supplied; visual fidelity to those original documents has not been verified.

## Demonstration scenarios

### Betty's team lunch

1. Open **Filters → Planning for a group**. Keep six diners.
2. Assign **Vegetarian** to Person 1, **Kosher** to Person 2, and **Gluten-free options** to Person 3. Leave Persons 4–6 unrestricted; optional labels can identify colleagues.
3. Keep University of Waterloo, 5 km. Strict mode works; the independently documented policy also works for the fixture.
4. Apply. **Cedar & Olive** qualifies with capacity 24 and a conservative six-person menu estimate of **$210** ($108–$210 range).
5. Open the details to compare each diner's suitable meals and sources. The gluten-free caveat remains explicit: this does not establish celiac-safe preparation.
6. Save the restaurant. Open **Shortlist** to compare and share/copy the summary to Teams or email.
7. Increase the party size beyond stated capacity to observe exclusion. Broaden the search and save other venues to compare; saved venues that fail current filters are labeled accordingly.

### Yousuf's halal investigation

1. Search **Saffron House**, open its summary, choose **View dietary evidence**.
2. Expand **Halal**: chicken is restaurant-reported. Expand **Certified halal meat** and **No alcohol in meal preparation**: supporting information is unknown.
3. Return; clear the search. Open filters in personal mode. Select **Halal**, **Certified halal meat**, and **No alcohol in meal preparation**.
4. In Strict mode, **Cedar & Olive** and **Spice Route Kitchen** have suitable fictional documented chicken meals. Saffron House does not qualify.
5. In Flexible mode, Saffron House appears separately as needing information. Independent-only does not turn its restaurant statement into a certificate.

### Other useful checks

- At Lotus Garden, vegetarian and gluten-free requirements work for two different diners, but cannot be combined into a suitable meal for one diner.
- Search **pasta** with Vegetarian enabled; query and meal requirements are evaluated together.
- Compare a 10 km radius with 3 km; change origin and watch distances recalculate.
- Select Vegan + Kosher + Certified halal meat within a 1 km radius for a zero-results state.
- Open filters, edit and cancel, then reopen: the applied settings remain. Save a profile, run a temporary group search, reload: your saved personal profile remains intact.

## Prototype limitations

All restaurants, locations, ratings, phone numbers, dietary claims and documents are simulated fixtures. Food images are locally stored illustrative stock photographs from Unsplash, not actual restaurant/menu photography. Sources are listed in `public/images/README.md`. There is no real certificate verification or medical/religious safety assessment. Gluten-free menu options never imply celiac-safe preparation. No real availability, certification authority, reservation, directions, ordering, calling, authentication or payment integration is represented. Demo phone details are displayed only, rather than initiating calls to fictitious numbers.

The map is an illustrative coordinate-based local map, not a navigation service. There is no geolocation. Profile and shortlist persistence is browser-local. Sharing sends/copies formatted text and requires no backend; users must manually send it in their chosen app. Some browsers require HTTPS or localhost for clipboard and Web Share; selectable text is the final fallback. Details are in-page states rather than bookmarkable routes; the visible Back to results button preserves applied filters.

## Tests

`src/tests/filtering.test.ts` covers dataset consistency, all-ten unrestricted results, single and combined diets, personal AND logic, separate group meals, Strict/Flexible, unknown and partial support, self-report vs independent policy, certification requirements, Haversine distances, origin changes, price-independent results, capacity, combined text/diet searches, zero results, ordering, default reset, profile separation, shortlist persistence, malformed storage, input validation and draft isolation.

Run `npm test` and `npm run build` before deployment.

## Deploy to Netlify

The included `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: `/*` → `/index.html` (200)

Push this folder's contents to your `Sunnywithachance/MSE343` GitHub repository. In Netlify, import that repository as a new project (or connect it to your existing Netlify project). The base directory is the repository root: this local folder is named `prototype`, but its **contents** are the root of the cloned repository. Do not enter `prototype` as Netlify's base unless you later move the app into a subdirectory in GitHub.

Netlify will install from `package-lock.json`, run the build and publish `dist`. Future pushes to the connected deployment branch trigger builds. No environment variables are needed. Alternatively, run `npm run build` locally and upload the generated **dist** folder through Netlify's manual deploy interface. Do not upload the unbuilt source folder.

The same `dist` output can be served by another static host. No Sites hosting account is required; Netlify is the selected deployment target. Netlify deployment is configured through the connected GitHub repository.

## Visual theme

The sunny yellow-and-white theme is defined in `src/theme.css`, layered over the base layout in `src/index.css`. It uses yellow `#FFC629`, pale yellow `#FFF6D9`, charcoal `#292A27`, white cards and warm neutral backgrounds. Dietary support, unknown and unsupported status colours retain their semantic meaning.

The mobile interface includes a fixed bottom navigation bar for discovery, the illustrative map, search filters, saved restaurants and the dietary profile. Quick dietary chips toggle temporary personal search requirements. In group mode they open the full filter editor so requirements remain assigned to individual diners. **All food** explicitly starts a personal search with no dietary requirements.

## Allergies, egg-free and sugar-conscious workflow

Open **Allergies** in the quick categories, or use **Filters / My profile**. The allergy entry jumps directly to the preset controls. Choose Sesame, Peanuts, Walnuts, Almonds, Cashews, All tree nuts, All nuts, Egg, Milk, Soy, Wheat, Fish or Shellfish. All nuts covers peanuts and tree nuts (including a record for other tree nuts); sesame is separate. Each preset can also be assigned to a different group diner. Apply, inspect restaurant-specific evidence, revise filters, or explicitly save personal preferences. Active chips, map markers, shortlist comparisons and sharing use the same computed results.

The **Egg-free ingredients** dietary preference checks recipe ingredients only. The **Egg** allergy preset additionally evaluates preparation/handling evidence. This distinction is deliberate; ingredient exclusions alone do not confirm cross-contact precautions.

`src/data/foodNeedFixtures.ts` contains explicit fictional ingredient states for every meal and allergen: contains, absent from the recorded recipe, or unknown. Missing records are never inferred from vegan labels or menu text. Handling is separately documented, shared, or unknown. Strict allergy matches require recorded ingredient exclusions and simulated handling procedures under the selected evidence policy. Flexible can show incomplete ingredient/handling evidence; known-containing meals cannot qualify. Restaurant-level matches still require a single compatible main per diner, rather than combining different meals to satisfy one person's needs. Even a full information match is not an allergy-safety guarantee; the interface consistently asks users to confirm ingredients and handling with the restaurant.

**Sugar-conscious** is a transparent prototype preference: at most **5 g added sugar per demo main-course portion**, with total carbohydrate information recorded. This threshold is a demo design choice, **not a clinical recommendation or diabetes assessment**. Evidence shows total carbohydrate, total sugar, added sugar, fibre, serving basis, source and date. Missing nutrition information stays unknown. These simulated numbers must never be used to make real treatment or insulin decisions.

The distinction between ingredients and cross-contact is informed by the [FDA's food-allergy guidance](https://www.fda.gov/food/buy-store-serve-safe-food/food-allergies-what-you-need-know). Showing total carbohydrate alongside sugar is informed by the [American Diabetes Association's carbohydrate guidance](https://diabetes.org/food-nutrition/understanding-carbs/carb-counting-and-diabetes); it does not turn the app into individualized medical advice.

To demonstrate: select Sesame + All nuts, then Egg-free ingredients + Sugar-conscious. Green Bowl Kitchen's lentil main, Cedar & Olive's chicken, Spice Route Kitchen's dal and Garden Table Café's harvest bowl have appropriate simulated information. Compare these with shared-equipment examples in Flexible, and open Saffron House to see unknown nut information and a cashew-containing meal. Personal selections persist only when explicitly saved; group needs remain separate.

## Price display

Budget filtering has been removed. There are no per-person or total-budget controls, price-limit chips, budget validation, or price-based exclusions in the matching engine. Restaurant price ranges and estimated group menu costs remain informational. Sorting by price changes order only; it does not remove results.
