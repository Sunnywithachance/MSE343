import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Home,
  Heart,
  Bookmark,
  Check,
  CircleHelp,
  Compass,
  Copy,
  Leaf,
  MapPin,
  Search,
  Share2,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  requirements,
  isAllergyRequirement,
  type Filters,
  type Profile,
  type Requirement,
} from "./types";
import { origins, restaurants } from "./data/restaurants";
import {
  applyProfile,
  defaultFilters,
  evaluateRestaurant,
  filterRestaurants,
  profileFromFilters,
} from "./utils/engine";
import {
  loadProfile,
  loadShortlist,
  readStored,
  saveShortlist,
  writeStored,
} from "./utils/storage";
import { sugarCaveat } from "./utils/foodNeeds";
import { Brand, DietPicker, Modal } from "./components/shared";
import FilterDrawer, { EvidenceControls } from "./components/FilterDrawer";
import RestaurantMap from "./components/RestaurantMap";
import RestaurantCard from "./components/RestaurantCard";
import RestaurantDetails from "./components/RestaurantDetails";
export default function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [filters, setFilters] = useState<Filters>(() =>
    applyProfile(defaultFilters(), loadProfile()),
  );
  const [panel, setPanel] = useState<
    "filters" | "profile" | "shortlist" | null
  >(null);
  const [allergyEntry, setAllergyEntry] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<string[]>(loadShortlist);
  const [recent, setRecent] = useState<string[]>(() => {
    const value = readStored<unknown>("recent", []);
    return Array.isArray(value)
      ? value.filter((x) => typeof x === "string").slice(0, 5)
      : [];
  });
  const [suggestions, setSuggestions] = useState(false);
  const [toast, setToast] = useState("");
  const [shareText, setShareText] = useState("");
  const results = useMemo(
    () => filterRestaurants(restaurants, filters),
    [filters],
  );
  const full = results.filter((r) => r.status === "full").length;
  const partial = results.length - full;
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  const notifyStorage = (ok: boolean, success: string) =>
    setToast(
      ok
        ? success
        : "Browser storage is unavailable. Changes are kept for this session only.",
    );
  const saveProfile = (p: Profile) => {
    setProfile(p);
    notifyStorage(writeStored("profile", p), "Dietary preferences saved.");
  };
  const toggleSave = (id: string) => {
    const next = shortlist.includes(id)
      ? shortlist.filter((x) => x !== id)
      : [...shortlist, id];
    setShortlist(next);
    notifyStorage(
      saveShortlist(next),
      next.includes(id)
        ? "Added to your shortlist."
        : "Removed from your shortlist.",
    );
  };
  const rememberSearch = (q: string) => {
    if (q.trim()) {
      const next = [q.trim(), ...recent.filter((x) => x !== q.trim())].slice(
        0,
        5,
      );
      setRecent(next);
      writeStored("recent", next);
    }
    setSuggestions(false);
  };
  const openDetails = (id: string) => {
    setDetail(id);
    setSuggestions(false);
    window.scrollTo(0, 0);
  };
  const selectMarker = (id: string) => {
    setSelected(id);
    document
      .getElementById(`card-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const allRequirements =
    filters.mode === "personal"
      ? filters.requirements.map((requirement) => ({
          requirement,
          label: requirements[requirement],
          index: -1,
        }))
      : filters.diners.flatMap((d, index) =>
          d.requirements.map((requirement) => ({
            requirement,
            label: `${d.label || `Person ${index + 1}`}: ${requirements[requirement]}`,
            index,
          })),
        );
  const removeRequirement = (requirement: Requirement, index: number) => {
    const remove = (list: Requirement[]) =>
      list.filter(
        (k) =>
          k !== requirement &&
          !(
            requirement === "halal" &&
            (k === "certifiedHalal" || k === "noAlcohol")
          ),
      );
    setFilters((f) =>
      index < 0
        ? { ...f, requirements: remove(f.requirements) }
        : {
            ...f,
            diners: f.diners.map((d, i) =>
              i === index ? { ...d, requirements: remove(d.requirements) } : d,
            ),
          },
    );
  };
  const suggestionOptions = [
    ...new Set(
      restaurants.flatMap((r) => [
        r.name,
        r.cuisine,
        ...r.meals.filter((m) => m.main).map((m) => m.name),
      ]),
    ),
  ]
    .filter((s) => s.toLowerCase().includes(filters.query.toLowerCase()))
    .slice(0, 7);
  const share = async () => {
    const text = `Plateful · Restaurant shortlist (fictional academic prototype)\nSearching near ${origins[filters.origin].name}\n${shortlist
      .map((id) => {
        const r = restaurants.find((r) => r.id === id)!;
        const e = evaluateRestaurant(r, filters);
        return `\n${r.name} · ${e.distance.toFixed(1)} km · $${r.price[0]}–$${r.price[1]} per person\n${e.status === "full" ? "Full match" : e.status === "partial" ? "Needs information" : "Does not match current filters"} · ${e.supported}/${e.total} requirements supported${filters.mode === "group" ? ` · Conservative group menu estimate: $${e.estimate}` : ""}\n${e.diners.map((d) => `${d.diner.label}: ${d.diner.requirements.map((k) => requirements[k]).join(", ") || "No specified restrictions"} — ${d.status === "full" ? "Supported" : d.status === "partial" ? "Unconfirmed" : "Not supported"}`).join("\n")}`;
      })
      .join(
        "\n",
      )}\n\nSimulated evidence only. Gluten-free options do not establish celiac-safe preparation. Allergy matches are not safety guarantees; confirm cross-contact handling directly. Sugar-conscious is a demo added-sugar preference, not diabetes advice. Prices exclude tax, tips, drinks and extras. No actual availability is claimed.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Plateful shortlist", text });
        setToast("Shortlist shared.");
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast("Shortlist copied. Ready to paste into Teams or email.");
    } catch {
      setShareText(text);
      setToast("Select and copy your shortlist below.");
    }
  };
  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <button
            className="brand-button"
            onClick={() => {
              setDetail(null);
              window.scrollTo(0, 0);
            }}
            aria-label="Plateful home"
          >
            <Brand />
          </button>
          <nav aria-label="Main navigation">
            <button
              className={!detail ? "nav-item current" : "nav-item"}
              onClick={() => setDetail(null)}
            >
              <Compass size={18} />
              <span>Discover</span>
            </button>
            <button className="nav-item" onClick={() => setPanel("shortlist")}>
              <Bookmark size={18} />
              <span>Shortlist</span>
              {shortlist.length > 0 && <b>{shortlist.length}</b>}
            </button>
            <button
              className="profile-nav"
              aria-label="My profile"
              onClick={() => setPanel("profile")}
            >
              <UserRound size={17} />
              <span>My profile</span>
            </button>
          </nav>
        </div>
      </header>
      {detail ? (
        <RestaurantDetails
          key={detail}
          result={evaluateRestaurant(
            restaurants.find((r) => r.id === detail)!,
            filters,
          )}
          filters={filters}
          saved={shortlist.includes(detail)}
          onBack={() => setDetail(null)}
          onSave={() => toggleSave(detail)}
        />
      ) : (
        <main className="discover-page">
          <section className="intro">
            <div>
              <p className="eyebrow">
                <span /> WATERLOO REGION · RESTAURANT EXPLORER
              </p>
              <h1>
                Let’s eat.
                <br />
                Food that fits <em>you.</em>
              </h1>
              <p>Good food. Your needs. Everyone welcome.</p>
            </div>
            <div className="intro-note">
              <Leaf size={22} />
              <span>
                A place for everyone.
                <br />
                <strong>Find your kind of good.</strong>
              </span>
            </div>
          </section>
          <section className="search-area" aria-label="Restaurant search">
            <form
              className="search-form"
              onSubmit={(e) => {
                e.preventDefault();
                rememberSearch(filters.query);
                searchRef.current?.blur();
              }}
            >
              <Search size={21} />
              <input
                ref={searchRef}
                aria-label="Search restaurants or dishes"
                placeholder="Search restaurants or dishes..."
                value={filters.query}
                onFocus={() => setSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSuggestions(false);
                }}
                onChange={(e) => {
                  setFilters({ ...filters, query: e.target.value });
                  setSuggestions(true);
                }}
              />
              {filters.query && (
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setFilters({ ...filters, query: "" });
                    searchRef.current?.focus();
                  }}
                >
                  <X size={17} />
                </button>
              )}
              <div className="search-divider" />
              <span className="search-location">
                <MapPin size={16} />
                {origins[filters.origin].name}
              </span>
              <button
                className="filter-button"
                aria-label="Filters"
                aria-haspopup="dialog"
                type="button"
                onClick={() => {
                  setSuggestions(false);
                  setPanel("filters");
                }}
              >
                <SlidersHorizontal size={18} />
                Filters
                {allRequirements.length > 0 && <b>{allRequirements.length}</b>}
              </button>
            </form>
            <div className="quick-diets" aria-label="Quick dietary filters">
              <button
                className={
                  filters.mode === "personal" && !filters.requirements.length
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    mode: "personal",
                    requirements: [],
                  }))
                }
              >
                <span aria-hidden="true">🍽️</span>All food
              </button>
              <button
                className={
                  allRequirements.some((x) =>
                    isAllergyRequirement(x.requirement),
                  )
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setAllergyEntry(true);
                  setPanel("filters");
                }}
              >
                <span aria-hidden="true">🥜</span>Allergies
              </button>
              {(
                [
                  { key: "vegetarian", label: "Vegetarian", icon: "🥗" },
                  { key: "vegan", label: "Vegan", icon: "🥑" },
                  { key: "halal", label: "Halal", icon: "🥙" },
                  { key: "glutenFree", label: "Gluten-free", icon: "🍚" },
                  { key: "eggFree", label: "Egg-free", icon: "🥚" },
                  {
                    key: "sugarConscious",
                    label: "Sugar-conscious",
                    icon: "🍓",
                  },
                ] as const
              ).map((d) => (
                <button
                  key={d.key}
                  aria-pressed={
                    filters.mode === "personal" &&
                    filters.requirements.includes(d.key)
                  }
                  className={
                    filters.mode === "personal" &&
                    filters.requirements.includes(d.key)
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    if (filters.mode === "group") {
                      setPanel("filters");
                      return;
                    }
                    setFilters((f) => ({
                      ...f,
                      requirements: f.requirements.includes(d.key)
                        ? f.requirements.filter(
                            (k) =>
                              k !== d.key &&
                              !(
                                d.key === "halal" &&
                                (k === "certifiedHalal" || k === "noAlcohol")
                              ),
                          )
                        : [...f.requirements, d.key],
                    }));
                  }}
                >
                  <span aria-hidden="true">{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>
            {suggestions && (
              <div className="search-suggestions">
                <div className="section-title">
                  <h3>
                    {filters.query
                      ? "Search suggestions"
                      : "Find your next favourite"}
                  </h3>
                  <button
                    className="icon-button"
                    aria-label="Close search suggestions"
                    onClick={() => setSuggestions(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="helper">
                  Suggestions search within your existing dietary filters.
                </p>
                {suggestionOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilters({ ...filters, query: s });
                      rememberSearch(s);
                    }}
                  >
                    <Search size={15} />
                    <span>{s}</span>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {!suggestionOptions.length && (
                  <p>No suggestions. Try a restaurant, dish or cuisine.</p>
                )}
                {recent.length > 0 && (
                  <>
                    <div className="section-title">
                      <h4>Recent searches</h4>
                      <button
                        className="text-button"
                        onClick={() => {
                          setRecent([]);
                          writeStored("recent", []);
                        }}
                      >
                        Clear recent searches
                      </button>
                    </div>
                    {recent.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setFilters({ ...filters, query: s });
                          rememberSearch(s);
                        }}
                      >
                        <Search size={15} />
                        {s}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
            <div className="filter-chips">
              <span className="filter-caption">YOUR SEARCH</span>
              {filters.mode === "group" && (
                <button
                  className="chip"
                  onClick={() => setFilters({ ...filters, mode: "personal" })}
                >
                  <UsersRound size={13} />
                  {filters.diners.length} diners
                  <X size={12} />
                </button>
              )}
              {allRequirements.map((x, i) => (
                <button
                  key={`${x.index}-${x.requirement}-${i}`}
                  className="chip dietary"
                  onClick={() => removeRequirement(x.requirement, x.index)}
                  aria-label={`Remove ${x.label} filter`}
                >
                  {x.label}
                  <X size={12} />
                </button>
              ))}
              {filters.radius < 20 && (
                <button
                  className="chip"
                  onClick={() => setFilters({ ...filters, radius: 20 })}
                >
                  Within {filters.radius} km
                  <X size={12} />
                </button>
              )}
              {filters.independent && (
                <button
                  className="chip"
                  onClick={() => setFilters({ ...filters, independent: false })}
                >
                  Documented evidence only
                  <X size={12} />
                </button>
              )}
              <button
                className="quiet-chip"
                onClick={() => setPanel("filters")}
              >
                {filters.strict ? "Strict" : "Flexible"} matching
                <SlidersHorizontal size={12} />
              </button>
              <button
                className="text-button reset-all"
                onClick={() => setFilters(defaultFilters())}
              >
                Reset all
              </button>
            </div>
          </section>
          <div className="discovery-grid">
            <aside className="map-column" id="discovery-map">
              <RestaurantMap
                results={results}
                origin={filters.origin}
                selected={selected}
                onSelect={selectMarker}
              />
              <div className="trust-note">
                <span className="trust-icon">
                  <Leaf size={17} />
                </span>
                <p>
                  <strong>
                    Informed choices start with clear information.
                  </strong>
                  <br />
                  Explore the evidence behind every dietary label.
                </p>
              </div>
            </aside>
            <section
              className="results-column"
              aria-label="Matching restaurants"
            >
              <div className="results-heading">
                <div aria-live="polite">
                  <p className="eyebrow">A PLACE FOR YOUR PLATE</p>
                  <h2>
                    {results.length}{" "}
                    {results.length === 1 ? "restaurant" : "restaurants"}{" "}
                    {filters.strict ? "match" : "to explore"}
                  </h2>
                  <p>
                    {partial
                      ? `${full} full matches · ${partial} need more information`
                      : `Near ${origins[filters.origin].name}`}
                  </p>
                </div>
                <label className="sort-label">
                  <span>Sort by</span>
                  <select
                    aria-label="Sort restaurants"
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sort: e.target.value as Filters["sort"],
                      })
                    }
                  >
                    <option value="nearest">Nearest first</option>
                    <option value="price">Lowest estimated price</option>
                    <option value="match">Best dietary match</option>
                  </select>
                </label>
              </div>
              <div className="match-legend" aria-label="Dietary support legend">
                <span>✓ Supported</span>
                <span>~ Partially supported</span>
                <span>? Information unknown</span>
                <span>× Not supported</span>
              </div>
              {allRequirements.some((x) =>
                isAllergyRequirement(x.requirement),
              ) && (
                <div className="discovery-allergy-note">
                  <strong>Exploring allergy information</strong>
                  <p>
                    Full matches have recorded ingredient exclusions and
                    simulated handling notes. Cross-contact risk is not
                    guaranteed; confirm directly with the restaurant.
                  </p>
                </div>
              )}
              {allRequirements.some(
                (x) => x.requirement === "sugarConscious",
              ) && (
                <div className="discovery-allergy-note">
                  <strong>Sugar-conscious preference</strong>
                  <p>{sugarCaveat}</p>
                </div>
              )}
              {results.length ? (
                results.map((result, i) => (
                  <Fragment key={result.restaurant.id}>
                    {!filters.strict &&
                      result.status === "partial" &&
                      (i === 0 || results[i - 1].status === "full") && (
                        <div className="uncertain-heading">
                          <CircleHelp size={18} />
                          <div>
                            <strong>Worth a closer look</strong>
                            <p>
                              These options need more information before all
                              requirements can be confirmed.
                            </p>
                          </div>
                        </div>
                      )}
                    <RestaurantCard
                      result={result}
                      index={i}
                      saved={shortlist.includes(result.restaurant.id)}
                      selected={selected === result.restaurant.id}
                      onSelect={() => setSelected(result.restaurant.id)}
                      onSave={() => toggleSave(result.restaurant.id)}
                      onOpen={() => openDetails(result.restaurant.id)}
                    />
                  </Fragment>
                ))
              ) : (
                <div className="empty-state">
                  <span>
                    <Search size={28} />
                  </span>
                  <h3>No restaurants match this search</h3>
                  <p>
                    Try a wider distance or Flexible matching to explore
                    unconfirmed options. Your saved profile will stay the same.
                  </p>
                  <button
                    className="primary"
                    onClick={() => setPanel("filters")}
                  >
                    Adjust filters
                    <SlidersHorizontal size={16} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setFilters(defaultFilters())}
                  >
                    Reset search
                  </button>
                </div>
              )}
              <p className="results-footnote">
                Prices and restaurant locations are fictional demo data.
                Menu-only estimates exclude tax, tips and extras.
              </p>
            </section>
          </div>
        </main>
      )}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          className={!detail ? "active" : ""}
          onClick={() => {
            setDetail(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Home size={21} />
          <span>Discover</span>
        </button>
        <button
          onClick={() => {
            setDetail(null);
            setTimeout(
              () =>
                document
                  .getElementById("discovery-map")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" }),
              0,
            );
          }}
        >
          <MapPin size={21} />
          <span>Map</span>
        </button>
        <button
          className="bottom-filter"
          aria-label="Open search filters"
          onClick={() => setPanel("filters")}
        >
          <SlidersHorizontal size={23} />
        </button>
        <button onClick={() => setPanel("shortlist")}>
          <Heart size={21} />
          <span>Saved{shortlist.length ? ` · ${shortlist.length}` : ""}</span>
        </button>
        <button
          aria-label="Dietary profile"
          onClick={() => setPanel("profile")}
        >
          <UserRound size={21} />
          <span>Profile</span>
        </button>
      </nav>
      <footer className="site-footer">
        <span>
          <strong>Plateful</strong> · Find food that fits you.
        </span>
        <span>MSE 343 · Group 19 — Mouseketeers · Academic prototype</span>
      </footer>
      {panel === "filters" && (
        <FilterDrawer
          applied={filters}
          focusAllergies={allergyEntry}
          onClose={() => {
            setPanel(null);
            setAllergyEntry(false);
          }}
          onApply={(f) => {
            setFilters(f);
            setAllergyEntry(false);
            setPanel(null);
            setSelected(null);
            rememberSearch(f.query);
            setToast("Search updated. Your saved profile has not changed.");
          }}
          onSave={(f) => saveProfile(profileFromFilters(f))}
        />
      )}
      {panel === "profile" && (
        <ProfilePanel
          profile={profile}
          onClose={() => setPanel(null)}
          onSave={saveProfile}
          onFind={(p) => {
            setFilters((f) => applyProfile(f, p));
            setPanel(null);
            setDetail(null);
          }}
        />
      )}
      {panel === "shortlist" && (
        <Modal
          title="Your shortlist"
          subtitle="Compare a few good options, then share the possibilities."
          onClose={() => {
            setPanel(null);
            setShareText("");
          }}
          wide
          footer={
            <button
              className="primary full-width"
              disabled={!shortlist.length}
              onClick={share}
            >
              <Share2 size={17} />
              Share or copy shortlist
            </button>
          }
        >
          {shortlist.length ? (
            <>
              <p className="helper">
                Compatibility is recalculated using your current search. Saving
                does not imply suitability or availability.
              </p>
              {shortlist.map((id) => {
                const r = restaurants.find((r) => r.id === id);
                if (!r) return null;
                const e = evaluateRestaurant(r, filters);
                return (
                  <article className="shortlist-card" key={id}>
                    <div className="section-title">
                      <button
                        className="shortlist-name"
                        onClick={() => {
                          setPanel(null);
                          openDetails(id);
                        }}
                      >
                        {r.name}
                        <ArrowRight size={15} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => toggleSave(id)}
                        aria-label={`Remove ${r.name} from shortlist`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                    <p>
                      {e.distance.toFixed(1)} km · ${r.price[0]}–${r.price[1]}{" "}
                      per person
                    </p>
                    <span className={`match-badge ${e.status}`}>
                      {e.status === "full"
                        ? "Full match"
                        : e.status === "partial"
                          ? "Needs information"
                          : "Does not match current filters"}
                    </span>
                    <p>
                      {e.supported} of {e.total} requirements supported
                    </p>
                    {filters.mode === "group" && (
                      <p>
                        {filters.diners.length} diners · ${e.estimate}{" "}
                        conservative menu estimate · Capacity {r.capacity}
                      </p>
                    )}
                    {e.reasons.map((reason) => (
                      <p className="warning-text" key={reason}>
                        {reason}
                      </p>
                    ))}
                  </article>
                );
              })}
              {shareText && (
                <label className="field">
                  Copy your shortlist
                  <textarea
                    aria-label="Shortlist text to copy"
                    rows={10}
                    readOnly
                    value={shareText}
                    onFocus={(e) => e.target.select()}
                  />
                  <span>
                    <Copy size={14} />
                    Select the text and use your device’s Copy action.
                  </span>
                </label>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Bookmark size={32} />
              <h3>Your next good meal starts here</h3>
              <p>
                Tap the bookmark on a restaurant to save it here. Then compare
                and share with your group.
              </p>
              <button className="secondary" onClick={() => setPanel(null)}>
                Explore restaurants
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
function ProfilePanel({
  profile,
  onClose,
  onSave,
  onFind,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
  onFind: (p: Profile) => void;
}) {
  const [draft, setDraft] = useState<Filters>(() =>
    applyProfile(defaultFilters(), profile),
  );
  const [save, setSave] = useState(true);
  return (
    <Modal
      title="Your dietary profile"
      subtitle="We’ll use your preferences to help you discover suitable restaurants. You can change them anytime."
      onClose={onClose}
      footer={
        <button
          className="primary full-width"
          onClick={() => {
            const p = profileFromFilters(draft);
            if (save) onSave(p);
            onFind(p);
          }}
        >
          Find restaurants
          <ArrowRight size={17} />
        </button>
      }
    >
      <div className="profile-intro">
        <span>
          <UserRound size={25} />
        </span>
        <div>
          <strong>A starting point, just for you.</strong>
          <p>
            Your profile stores personal preferences. Each search can have its
            own temporary filters.
          </p>
        </div>
      </div>
      <DietPicker
        value={draft.requirements}
        onChange={(requirements) => setDraft({ ...draft, requirements })}
      />
      <div className="filter-section">
        <EvidenceControls value={draft} onChange={setDraft} />
      </div>
      <label className="check-row save-check">
        <input
          type="checkbox"
          checked={save}
          onChange={(e) => setSave(e.target.checked)}
        />
        <span>
          <strong>Save my dietary preferences</strong>
          <small>Stored only in this browser. No account needed.</small>
        </span>
      </label>
      <div className="callout">
        These preferences help explore demo evidence. They do not provide
        medical or religious safety guarantees.
      </div>
    </Modal>
  );
}
