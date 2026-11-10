import { Heart, ArrowUpRight, MapPin, Check, CircleHelp } from "lucide-react";
import { requirements, isAllergyRequirement, type Result } from "../types";
import { FoodArt, Status, provenanceLabel } from "./shared";
export default function RestaurantCard({
  result,
  index,
  saved,
  selected,
  onSave,
  onOpen,
  onSelect,
}: {
  result: Result;
  index: number;
  saved: boolean;
  selected: boolean;
  onSave: () => void;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const r = result.restaurant;
  const hasAllergies = result.diners.some((d) =>
    d.diner.requirements.some(isAllergyRequirement),
  );
  const sugarMeal = result.diners.find((d) =>
    d.diner.requirements.includes("sugarConscious"),
  )?.bestMeal;
  const relevant = result.diners
    .flatMap((d) => d.requirements)
    .filter(
      (r, i, all) =>
        all.findIndex((x) => x.requirement === r.requirement) === i,
    )
    .slice(0, 3);
  const fullMains = new Set(
    result.diners.flatMap((d) => d.meals.map((m) => m.id)),
  ).size;
  return (
    <article
      id={`card-${r.id}`}
      className={`restaurant-card ${selected ? "selected" : ""}`}
      onMouseEnter={onSelect}
    >
      <div className="card-visual">
        <FoodArt kind={r.art} color={r.color} label={r.cuisine + " food"} />
        <span className="card-map-index">{index + 1}</span>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={onSave}
          aria-label={`${saved ? "Remove" : "Save"} ${r.name} ${saved ? "from" : "to"} shortlist`}
          aria-pressed={saved}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="illustration-label">Sample photo</span>
      </div>
      <div className="card-content">
        <div className="card-title-row">
          <h3>
            <button onClick={onOpen}>{r.name}</button>
          </h3>
          <span className={`match-badge ${result.status}`}>
            {result.status === "full" ? (
              <Check size={13} />
            ) : (
              <CircleHelp size={13} />
            )}
            {result.status === "full" ? "Full match" : "Needs information"}
          </span>
        </div>
        <p className="restaurant-meta">
          {r.cuisine}
          <span>·</span>
          <MapPin size={12} />
          {result.distance.toFixed(1)} km<span>·</span>${r.price[0]}–$
          {r.price[1]} <small>/ person</small>
        </p>
        <div className="card-diet-details">
          {relevant.length ? (
            relevant.map((item) => (
              <div key={item.requirement}>
                <Status status={item.support}>
                  {requirements[item.requirement]}
                </Status>
                <small>{provenanceLabel[item.claim.provenance]}</small>
              </div>
            ))
          ) : (
            <>
              <span className="plain-diet">
                <Check size={13} />
                {
                  r.meals.filter(
                    (m) =>
                      m.main && m.claims.vegetarian.support === "supported",
                  ).length
                }{" "}
                vegetarian main courses
              </span>
              <small>Explore menu-level evidence</small>
            </>
          )}
        </div>
        {hasAllergies && (
          <p className="card-allergy-note">
            Allergy information only. Confirm ingredients and cross-contact with
            the restaurant.
          </p>
        )}
        {sugarMeal?.nutritionFacts && (
          <p className="card-nutrition-note">
            {sugarMeal.nutritionFacts.addedSugars} g added sugar ·{" "}
            {sugarMeal.nutritionFacts.totalCarbs} g carbs
            <br />
            <small>Per demo portion of {sugarMeal.name}</small>
          </p>
        )}
        <div className="card-bottom">
          <span>
            {result.total
              ? `${result.supported} of ${result.total} requirements supported`
              : `${fullMains} main-course options`}
            {result.total > 0 && (
              <small>
                {fullMains
                  ? `${fullMains} supported main-course options`
                  : "No fully supported main course confirmed"}
              </small>
            )}
            {result.diners.length > 1 && (
              <small>Group menu estimate: ${result.estimate}</small>
            )}
          </span>
          <button className="details-button" onClick={onOpen}>
            View details
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
