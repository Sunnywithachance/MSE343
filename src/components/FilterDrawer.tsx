import { useEffect, useState } from "react";
import {
  UserRound,
  UsersRound,
  MapPin,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { Filters } from "../types";
import { origins } from "../data/restaurants";
import {
  defaultFilters,
  filterRestaurants,
  validateFilters,
} from "../utils/engine";
import { restaurants } from "../data/restaurants";
import { DietPicker, Modal } from "./shared";
export function EvidenceControls({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <>
      <fieldset>
        <legend>
          <ShieldCheck size={17} /> Evidence policy
        </legend>
        <label className="radio-card">
          <input
            type="radio"
            name="evidence-policy"
            checked={!value.independent}
            onChange={() => onChange({ ...value, independent: false })}
          />
          <span>
            <strong>Include restaurant-reported claims</strong>
            <small>Accept documented evidence and restaurant statements.</small>
          </span>
        </label>
        <label className="radio-card">
          <input
            type="radio"
            name="evidence-policy"
            checked={value.independent}
            onChange={() => onChange({ ...value, independent: true })}
          />
          <span>
            <strong>Independently documented evidence only</strong>
            <small>Self-reported claims alone cannot be a full match.</small>
          </span>
        </label>
      </fieldset>
      <fieldset>
        <legend>How closely should results match?</legend>
        <div className="mode-cards">
          {[true, false].map((strict) => (
            <button
              type="button"
              key={String(strict)}
              className={
                value.strict === strict ? "mode-card active" : "mode-card"
              }
              aria-pressed={value.strict === strict}
              onClick={() => onChange({ ...value, strict })}
            >
              <strong>{strict ? "Strict" : "Flexible"}</strong>
              <small>
                {strict
                  ? "Enough evidence for every selected requirement."
                  : "Also include partial or unconfirmed options, shown separately."}
              </small>
            </button>
          ))}
        </div>
        <small>
          Strict describes available evidence. It is not a medical or religious
          safety guarantee.
        </small>
      </fieldset>
    </>
  );
}
export default function FilterDrawer({
  applied,
  onApply,
  onClose,
  onSave,
  focusAllergies = false,
}: {
  focusAllergies?: boolean;
  applied: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
  onSave: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(() => structuredClone(applied));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!focusAllergies) return;
    const frame = requestAnimationFrame(() => {
      const section = document.querySelector("dialog .allergy-picker");
      section?.scrollIntoView({ block: "start" });
      section?.querySelector("button")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusAllergies]);
  const patch = (p: Partial<Filters>) => {
    setDraft((d) => ({ ...d, ...p }));
    setSaved(false);
    setError("");
  };
  const count = filterRestaurants(restaurants, draft).length;
  const setCount = (n: number) => {
    const count = Math.max(1, Math.min(20, n || 1));
    patch({
      diners: Array.from(
        { length: count },
        (_, i) =>
          draft.diners[i] ?? { label: `Person ${i + 1}`, requirements: [] },
      ),
    });
  };
  return (
    <Modal
      title="Filter this search"
      subtitle="Find restaurants that work for your needs."
      onClose={onClose}
      footer={
        <>
          <button
            className="text-button"
            onClick={() => {
              setDraft(defaultFilters());
              setError("");
            }}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            className="primary"
            onClick={() => {
              const issue = validateFilters(draft);
              if (issue) setError(issue);
              else onApply(draft);
            }}
          >
            Show {count} matching restaurants
            <ArrowRight size={17} />
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </>
      }
    >
      <section className="filter-section">
        <h3>
          <span>01</span> Who’s joining?
        </h3>
        <div className="segmented">
          <button
            className={draft.mode === "personal" ? "active" : ""}
            onClick={() => patch({ mode: "personal" })}
          >
            <UserRound size={17} />
            Just for me
          </button>
          <button
            className={draft.mode === "group" ? "active" : ""}
            onClick={() => patch({ mode: "group" })}
          >
            <UsersRound size={17} />
            Planning for a group
          </button>
        </div>
        <p className="helper">
          {draft.mode === "personal"
            ? "One main course must meet all your selected meal requirements together."
            : "Different diners can have different meals. We check each person separately."}
        </p>
        {draft.mode === "group" && (
          <label className="field">
            Number of diners
            <input
              type="number"
              min="1"
              max="20"
              value={draft.diners.length}
              onChange={(e) => setCount(e.target.valueAsNumber)}
            />
          </label>
        )}
      </section>
      <section className="filter-section">
        <h3>
          <span>02</span> Dietary needs
        </h3>
        {draft.mode === "personal" ? (
          <DietPicker
            value={draft.requirements}
            onChange={(requirements) => patch({ requirements })}
          />
        ) : (
          draft.diners.map((diner, i) => (
            <details className="diner" key={i} open={i < 3}>
              <summary>
                {diner.label || `Person ${i + 1}`}
                <small>
                  {diner.requirements.length
                    ? `${diner.requirements.length} selected`
                    : "No specified restrictions"}
                </small>
              </summary>
              <div className="disclosure-content">
                <label className="field">
                  Diner label
                  <input
                    maxLength={40}
                    value={diner.label}
                    onChange={(e) =>
                      patch({
                        diners: draft.diners.map((d, j) =>
                          j === i ? { ...d, label: e.target.value } : d,
                        ),
                      })
                    }
                  />
                </label>
                <DietPicker
                  value={diner.requirements}
                  onChange={(requirements) =>
                    patch({
                      diners: draft.diners.map((d, j) =>
                        j === i ? { ...d, requirements } : d,
                      ),
                    })
                  }
                />
              </div>
            </details>
          ))
        )}
        <div className="callout">
          Gluten-free options describe menu information. Cross-contact and
          celiac-safe preparation are unconfirmed; contact the restaurant for
          clarification.
        </div>
      </section>
      <section className="filter-section">
        <h3>
          <span>03</span> Confidence & evidence
        </h3>
        <EvidenceControls value={draft} onChange={setDraft} />
        <p className="helper">
          All documentation and claims are simulated prototype data.
        </p>
      </section>
      <section className="filter-section">
        <h3>
          <span>04</span> Location & distance
        </h3>
        <label className="field">
          <span>
            <MapPin size={15} />
            Searching near
          </span>
          <select
            value={draft.origin}
            onChange={(e) =>
              patch({ origin: e.target.value as Filters["origin"] })
            }
          >
            {Object.entries(origins).map(([key, v]) => (
              <option value={key} key={key}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="range-label" htmlFor="radius">
          Maximum distance<strong>{draft.radius} km</strong>
        </label>
        <input
          id="radius"
          type="range"
          min="1"
          max="20"
          value={draft.radius}
          onChange={(e) => patch({ radius: +e.target.value })}
        />
        <div className="range-ends">
          <span>1 km</span>
          <span>20 km</span>
        </div>
      </section>
      <section className="save-preferences">
        <strong>Make these your usual preferences?</strong>
        <p>
          Saving is explicit. Applying temporary filters never changes your
          profile.
        </p>
        <button
          className="secondary"
          disabled={draft.mode === "group"}
          onClick={() => {
            onSave(draft);
            setSaved(true);
          }}
        >
          {saved ? "Preferences saved" : "Save preferences"}
        </button>
        {draft.mode === "group" && (
          <small>
            Save personal dietary needs from “Just for me” or your profile.
            Group needs will not overwrite your profile.
          </small>
        )}
      </section>
    </Modal>
  );
}
