import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronDown,
  UsersRound,
} from "lucide-react";
import {
  requirements,
  allergyPresets,
  allergenLabels,
  isAllergyRequirement,
  type Filters,
  type Requirement,
  type Result,
} from "../types";
import {
  getRequirementClaim,
  allergyCaveat,
  sugarCaveat,
} from "../utils/foodNeeds";
import { evaluateRestaurant } from "../utils/engine";
import { FoodArt, Status, provenanceLabel } from "./shared";
import RestaurantMap from "./RestaurantMap";
export default function RestaurantDetails({
  result,
  filters,
  saved,
  onBack,
  onSave,
}: {
  result: Result;
  filters: Filters;
  saved: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  const [contact, setContact] = useState(false);
  const [evidenceOpened, setEvidenceOpened] = useState(false);
  const r = result.restaurant;
  // Evaluate compatibility without the query so every menu option is visible in the evidence page.
  const compatibility = evaluateRestaurant(r, { ...filters, query: "" });
  const keys = Array.from(
    new Set([
      ...compatibility.diners.flatMap((d) => d.diner.requirements),
      ...(Object.keys(requirements) as Requirement[]),
    ]),
  );
  const showEvidence = () => {
    setEvidenceOpened(true);
    setTimeout(
      () =>
        document
          .getElementById("dietary-evidence")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };
  return (
    <main className="detail-page">
      <button className="text-button back" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to results
      </button>
      <div className="detail-map-mobile">
        <RestaurantMap
          results={[result]}
          origin={filters.origin}
          selected={r.id}
          onSelect={() => {}}
          compact
        />
      </div>
      <div className="detail-hero">
        <div>
          <span className="eyebrow">A CLOSER LOOK</span>
          <h1>{r.name}</h1>
          <p>{r.description}</p>
          <p className="restaurant-meta">
            {r.cuisine} · <MapPin size={14} />
            {result.distance.toFixed(1)} km · ★ {r.rating}{" "}
            <small>(fictional demo rating)</small>
          </p>
          <div className="detail-actions">
            <button className="primary" onClick={showEvidence}>
              <ShieldCheck size={18} />
              View dietary evidence
            </button>
            <button className="secondary" onClick={onSave}>
              <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved to shortlist" : "Save to shortlist"}
            </button>
          </div>
        </div>
        <div className="detail-food">
          <FoodArt kind={r.art} color={r.color} label={r.cuisine + " meal"} />
          <span>Illustrative stock photo</span>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <section className="surface compatibility">
            <div className="section-title">
              <h2>Your compatibility</h2>
              <span className={`match-badge ${compatibility.status}`}>
                {compatibility.status === "full"
                  ? "Full match"
                  : compatibility.status === "none"
                    ? "Does not match"
                    : "Needs information"}
              </span>
            </div>
            <p>
              {compatibility.supported} of {compatibility.total} selected
              requirements supported under your evidence policy.
            </p>
            {compatibility.reasons.map((reason) => (
              <p className="error" key={reason}>
                {reason}
              </p>
            ))}
            {compatibility.diners.map((d, i) => (
              <div className="diner-match" key={i}>
                <h3>{d.diner.label || `Person ${i + 1}`}</h3>
                {d.requirements.length ? (
                  d.requirements.map((x) => (
                    <div className="requirement-line" key={x.requirement}>
                      <span>{requirements[x.requirement]}</span>
                      <Status status={x.support} />
                    </div>
                  ))
                ) : (
                  <p className="helper">No specified restrictions.</p>
                )}
                <p className="meal-suggestion">
                  {d.status === "full"
                    ? "Suitable main courses: "
                    : d.status === "partial"
                      ? "Potential meal — clarification needed: "
                      : "No fully suitable meal confirmed. Closest recorded option: "}
                  {d.meals.length
                    ? d.meals.map((m) => m.name).join(", ")
                    : d.bestMeal?.name || "None recorded"}
                </p>
              </div>
            ))}
            <div className="callout">
              Gluten-free options are menu-level information, not confirmation
              of celiac-safe preparation. Cross-contact remains unconfirmed.
            </div>
          </section>
          <section className="surface evidence-section" id="dietary-evidence">
            <span className="eyebrow">KNOW WHAT’S BEHIND THE LABEL</span>
            <h2>Dietary evidence</h2>
            <p>
              Explore ingredients, preparation and the source of each claim.
            </p>
            <div className="prototype-note">
              <ShieldCheck size={18} />
              <span>
                Simulated evidence for academic prototype use. Every restaurant
                and document is fictional.
              </span>
            </div>
            {keys.map((key) => {
              const detailedFoodNeed =
                isAllergyRequirement(key) ||
                key === "eggFree" ||
                key === "sugarConscious";
              const meals = r.meals.filter(
                (m) =>
                  m.main &&
                  (detailedFoodNeed ||
                    getRequirementClaim(m, key).support !== "unsupported"),
              );
              const supported = meals.some(
                (m) => getRequirementClaim(m, key).support === "supported",
              );
              const status = supported
                ? "supported"
                : meals.some(
                      (m) => getRequirementClaim(m, key).support === "partial",
                    )
                  ? "partial"
                  : meals.some(
                        (m) =>
                          getRequirementClaim(m, key).support === "unknown",
                      )
                    ? "unknown"
                    : "unsupported";
              return (
                <details
                  className="evidence-item"
                  key={key}
                  open={evidenceOpened && key === "halal" ? true : undefined}
                >
                  <summary>
                    <span>
                      {requirements[key]}
                      <Status status={status} />
                    </span>
                    <ChevronDown size={18} />
                  </summary>
                  <div className="disclosure-content">
                    {!meals.length && (
                      <p>
                        The demo record explicitly does not support this
                        requirement for any main course.
                      </p>
                    )}
                    {key === "halal" && (
                      <div className="callout">
                        A halal claim does not establish certified halal meat or
                        alcohol-free preparation. Inspect those separate
                        sections below.
                      </div>
                    )}
                    {isAllergyRequirement(key) && (
                      <div className="allergy-guidance">
                        <strong>
                          Allergy information — not a safety guarantee
                        </strong>
                        <p>{allergyCaveat}</p>
                      </div>
                    )}
                    {key === "sugarConscious" && (
                      <div className="nutrition-guidance">
                        <p>{sugarCaveat}</p>
                      </div>
                    )}
                    {meals.map((meal) => {
                      const c = getRequirementClaim(meal, key);
                      return (
                        <div className="meal-evidence" key={meal.id}>
                          <h4>
                            {meal.name} <span>${meal.price}</span>
                          </h4>
                          <Status status={c.support} />
                          <p>{meal.description}</p>
                          <p>{c.note}</p>
                          <span className={`provenance ${c.provenance}`}>
                            {provenanceLabel[c.provenance]}
                          </span>
                          {c.date && (
                            <small>
                              {c.provenance === "independent"
                                ? "Evidence recorded"
                                : "Information updated"}
                              : {c.date}
                            </small>
                          )}
                          {c.certification && (
                            <div className="certificate">
                              <ShieldCheck size={18} />
                              <span>
                                {c.certification.name}
                                <small>
                                  Recorded {c.date} · Expires{" "}
                                  {c.certification.expires}
                                  <br />
                                  Fictional documentation; no recognized
                                  certification is implied.
                                </small>
                              </span>
                            </div>
                          )}
                          {filters.independent &&
                            c.provenance !== "independent" && (
                              <p className="warning-text">
                                This source does not meet your independently
                                documented evidence policy.
                              </p>
                            )}
                          {key === "glutenFree" && (
                            <p className="warning-text">{meal.caveat}</p>
                          )}
                          {(isAllergyRequirement(key) || key === "eggFree") && (
                            <div className="allergen-facts">
                              {(key === "eggFree"
                                ? (["egg"] as const)
                                : allergyPresets.find((p) => p.key === key)!
                                    .allergens
                              ).map((a) => {
                                const record = meal.allergens[a];
                                return (
                                  <div className="allergen-fact" key={a}>
                                    <strong>{allergenLabels[a]}</strong>
                                    <span>
                                      {record.ingredient === "contains"
                                        ? "Contains ingredient"
                                        : record.ingredient === "absent"
                                          ? "Excluded from recorded recipe"
                                          : "Ingredient information unknown"}
                                    </span>
                                    {key !== "eggFree" && (
                                      <>
                                        <span>
                                          Handling:{" "}
                                          {record.handling === "documented"
                                            ? "Simulated procedures documented"
                                            : record.handling === "shared"
                                              ? "Shared equipment — controls unconfirmed"
                                              : "Unknown"}
                                        </span>
                                        <p>{record.note}</p>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {(key === "sugarConscious" || key === "nutrition") &&
                            meal.nutritionFacts && (
                              <div className="nutrition-facts">
                                <small>
                                  Simulated values ·{" "}
                                  {meal.nutritionFacts.serving}
                                </small>
                                <dl>
                                  <div>
                                    <dt>Total carbohydrate</dt>
                                    <dd>{meal.nutritionFacts.totalCarbs} g</dd>
                                  </div>
                                  <div>
                                    <dt>Total sugar</dt>
                                    <dd>{meal.nutritionFacts.totalSugars} g</dd>
                                  </div>
                                  <div>
                                    <dt>Added sugar</dt>
                                    <dd>{meal.nutritionFacts.addedSugars} g</dd>
                                  </div>
                                  <div>
                                    <dt>Fibre</dt>
                                    <dd>{meal.nutritionFacts.fiber} g</dd>
                                  </div>
                                </dl>
                              </div>
                            )}
                          {key === "nutrition" && meal.nutrition && (
                            <p>{meal.nutrition}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </section>
          <section className="surface">
            <h2>On the demo menu</h2>
            {r.meals.map((m) => (
              <div className="menu-row" key={m.id}>
                <div>
                  <strong>{m.name}</strong>
                  <p>{m.description}</p>
                  <small>
                    {m.main
                      ? "Main course"
                      : "Side dish — does not count as a suitable main"}
                  </small>
                </div>
                <strong>${m.price}</strong>
              </div>
            ))}
          </section>
        </div>
        <aside className="detail-sidebar">
          <RestaurantMap
            results={[result]}
            origin={filters.origin}
            selected={r.id}
            onSelect={() => {}}
            compact
          />
          <section className="surface">
            <h3>Plan your visit</h3>
            <div className="info-row">
              <span>Estimated menu price</span>
              <strong>
                ${r.price[0]}–${r.price[1]} / person
              </strong>
            </div>
            {filters.mode === "group" && (
              <div className="info-row">
                <span>{filters.diners.length} diners</span>
                <strong>
                  ${r.price[0] * filters.diners.length}–${result.estimate} total
                </strong>
              </div>
            )}
            <p className="helper">
              Prices are informational estimates. Excludes tax, gratuity, drinks
              and extras; this is not a quote.
            </p>
            <div className="info-row">
              <span>
                <UsersRound size={16} />
                Stated capacity
              </span>
              <strong>{r.capacity} diners</strong>
            </div>
            <button
              className="secondary full-width"
              onClick={() => setContact(!contact)}
              aria-expanded={contact}
            >
              <Phone size={16} />
              Contact for clarification
            </button>
            {contact && (
              <div className="contact-info">
                <strong>Demo contact information</strong>
                <p>{r.phone}</p>
                <p>{r.address}</p>
                <p className="helper">
                  Fictional contact details. Live calling, directions and
                  ordering are outside this prototype. In a real setting, ask
                  about ingredients, certificates and cross-contact.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
