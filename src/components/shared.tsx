import { useEffect, useRef, type ReactNode } from "react";
import {
  X,
  Check,
  CircleHelp,
  Minus,
  ChevronDown,
  Leaf,
  Utensils,
} from "lucide-react";
import {
  requirements,
  allergyPresets,
  type Requirement,
  type Support,
} from "../types";
import { sugarCaveat, allergyCaveat } from "../utils/foodNeeds";
export const provenanceLabel = {
  independent: "Independently documented",
  reported: "Restaurant-reported",
  unknown: "Unknown",
};
export const statusLabel = {
  supported: "Supported",
  partial: "Partially supported",
  unknown: "Information unknown",
  unsupported: "Not supported",
};
export function Status({
  status,
  children,
}: {
  status: Support;
  children?: ReactNode;
}) {
  const Icon =
    status === "supported"
      ? Check
      : status === "unknown"
        ? CircleHelp
        : status === "unsupported"
          ? X
          : Minus;
  return (
    <span className={`status ${status}`}>
      <Icon size={14} />
      {children || statusLabel[status]}
    </span>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon">
        <Utensils size={22} />
        <Leaf size={13} />
      </span>
      <span>
        Plateful
        <span className="brand-sub">Dietary-aware restaurant explorer</span>
      </span>
    </span>
  );
}
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const before = document.activeElement as HTMLElement;
    el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      before?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`drawer ${wide ? "wide" : ""}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-layout">
        <header className="dialog-header">
          <div>
            <p className="eyebrow">MAKE ROOM FOR YOUR NEEDS</p>
            <h2 id="dialog-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            aria-label="Close panel without applying changes"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
const groups: { name: string; keys: Requirement[] }[] = [
  { name: "Diet", keys: ["vegetarian", "vegan", "pescatarian", "eggFree"] },
  { name: "Religious", keys: ["halal", "kosher"] },
  {
    name: "Additional considerations",
    keys: ["glutenFree", "lowSodium", "sugarConscious", "nutrition"],
  },
];
export function DietPicker({
  value,
  onChange,
  prefix = "",
}: {
  value: Requirement[];
  onChange: (v: Requirement[]) => void;
  prefix?: string;
}) {
  const toggle = (key: Requirement) => {
    let next = value.includes(key)
      ? value.filter((x) => x !== key)
      : [...value, key];
    if (key === "halal" && !next.includes("halal"))
      next = next.filter((x) => x !== "certifiedHalal" && x !== "noAlcohol");
    onChange(next);
  };
  return (
    <div className="diet-picker">
      {groups.map((g) => (
        <fieldset key={g.name}>
          <legend>
            {prefix}
            {g.name}
          </legend>
          <div className="choices">
            {g.keys.map((key) => (
              <button
                type="button"
                key={key}
                className={`choice ${value.includes(key) ? "chosen" : ""}`}
                aria-pressed={value.includes(key)}
                onClick={() => toggle(key)}
              >
                {value.includes(key) && <Check size={14} />}
                {requirements[key]}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset className="allergy-picker">
        <legend>Allergies & ingredients to avoid</legend>
        <p className="helper">
          Choose allergens for this diner. We check the same meal for every
          selected need.
        </p>
        <div className="choices">
          {allergyPresets.map((p) => (
            <button
              type="button"
              key={p.key}
              className={`choice ${value.includes(p.key) ? "chosen" : ""}`}
              aria-pressed={value.includes(p.key)}
              onClick={() => toggle(p.key)}
            >
              {value.includes(p.key) && <Check size={14} />}
              {p.label}
            </button>
          ))}
        </div>
        <p className="helper">
          All nuts includes peanuts and all tree nuts. Sesame is separate.
          Egg-free under Diet checks ingredients; Egg here also checks handling
          information.
        </p>
        {allergyPresets.some((p) => value.includes(p.key)) && (
          <div className="allergy-guidance">
            <strong>Ingredients and preparation are separate.</strong>
            <p>
              Strict needs recorded ingredient exclusions and documented
              handling. Flexible can include unconfirmed handling, clearly
              marked. Known-containing meals never qualify.
            </p>
            <small>{allergyCaveat}</small>
          </div>
        )}
      </fieldset>
      {value.includes("sugarConscious") && (
        <div className="nutrition-guidance">
          <strong>Sugar-conscious, with context</strong>
          <p>{sugarCaveat}</p>
          <small>
            We show added sugar, total sugar and total carbohydrate per portion.
            No meal is labeled diabetes-safe.
          </small>
        </div>
      )}
      {value.includes("halal") && (
        <fieldset className="halal-options">
          <legend>Halal-specific considerations</legend>
          {(["certifiedHalal", "noAlcohol"] as Requirement[]).map((key) => (
            <label className="check-row" key={key}>
              <input
                type="checkbox"
                checked={value.includes(key)}
                onChange={() => toggle(key)}
              />
              <span>{requirements[key]}</span>
            </label>
          ))}
          <small>
            Meat certification and alcohol-free preparation are separate
            requirements.
          </small>
        </fieldset>
      )}
    </div>
  );
}
export function Disclosure({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details>
      <summary>
        {title}
        <ChevronDown size={18} />
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  );
}
export function FoodArt({
  kind,
  color,
  label,
}: {
  kind: string;
  color: string;
  label: string;
}) {
  const photos: Record<string, string> = {
    bowl: "harvest-bowl",
    curry: "curry",
    noodles: "pasta",
    plate: "mezze",
  };
  return (
    <img
      className="food-art food-photo"
      src={`/images/${photos[kind] || "harvest-bowl"}.jpg`}
      alt={`Illustrative stock photo of ${label}; not an actual restaurant meal`}
      loading="lazy"
      style={{ backgroundColor: color }}
    />
  );
}
