import { MapPin, Navigation, Check, CircleHelp } from "lucide-react";
import { origins } from "../data/restaurants";
import type { Origin, Result } from "../types";
const xy = (lat: number, lng: number) => ({
  left: `${9 + ((lng + 80.575) / 0.12) * 82}%`,
  top: `${88 - ((lat - 43.397) / 0.105) * 78}%`,
});
export default function RestaurantMap({
  results,
  origin,
  selected,
  onSelect,
  compact = false,
}: {
  results: Result[];
  origin: Origin;
  selected: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const location = origins[origin];
  return (
    <div className={`map-shell ${compact ? "compact" : ""}`}>
      <div className="map-canvas">
        <svg
          className="map-drawing"
          width="100%"
          height="100%"
          aria-hidden="true"
          preserveAspectRatio="none"
          viewBox="0 0 600 620"
        >
          <rect width="600" height="620" fill="#eef0e6" />
          <path
            d="M10 10H220L245 98 180 200 30 180ZM352 50L570 20 600 190 470 220 370 150ZM30 320L177 265 237 430 180 530 0 490ZM410 380L590 335 600 570 500 600 422 515"
            fill="#dbe5d0"
          />
          <path
            d="M50 -30L222 640M-40 190L640 420M330 -20L290 640M600 40L-10 500M-20 80L640 265M450 -10L530 640M0 565L620 500"
            stroke="#fff"
            strokeWidth="19"
            fill="none"
          />
          <path
            d="M50 -30L222 640M-40 190L640 420M330 -20L290 640M600 40L-10 500M-20 80L640 265M450 -10L530 640M0 565L620 500"
            stroke="#dedfd4"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-15 270Q130 160 235 300T420 390T620 550"
            stroke="#c0dce0"
            strokeWidth="15"
            fill="none"
          />
          <path
            d="M50 -30L222 640M-40 190L640 420"
            stroke="#e9dcbb"
            strokeWidth="7"
            fill="none"
          />
          <g
            fill="#899487"
            fontSize="10"
            fontFamily="sans-serif"
            letterSpacing="2"
          >
            <text x="70" y="90">
              WATERLOO
            </text>
            <text x="270" y="265">
              UPTOWN
            </text>
            <text x="345" y="445">
              KITCHENER
            </text>
            <text x="30" y="370" transform="rotate(17 30 370)">
              WESTMOUNT RD
            </text>
            <text x="460" y="170" transform="rotate(78 460 170)">
              KING ST
            </text>
            <text x="140" y="580">
              WATERLOO REGION
            </text>
          </g>
          <g fill="#8ca57a" opacity=".5">
            {[30, 60, 90, 120, 400, 430, 460, 490, 520].map((x, i) => (
              <circle key={x} cx={x} cy={i < 4 ? 220 : 80} r="5" />
            ))}
          </g>
        </svg>
        <div
          className="origin-pin"
          style={xy(location.lat, location.lng)}
          title={`Search origin: ${location.name}`}
        >
          <span />
          <Navigation size={16} />
          <label>{location.name}</label>
        </div>
        {results.map((result, i) => (
          <button
            type="button"
            key={result.restaurant.id}
            className={`map-marker ${selected === result.restaurant.id ? "selected" : ""} ${result.status}`}
            style={xy(result.restaurant.lat, result.restaurant.lng)}
            aria-label={`Select ${result.restaurant.name}, ${result.status === "full" ? "full match" : "needs information"}`}
            aria-pressed={selected === result.restaurant.id}
            onClick={() => onSelect(result.restaurant.id)}
          >
            {result.status === "full" ? (
              <Check size={13} />
            ) : (
              <CircleHelp size={13} />
            )}
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="map-caption">
        <MapPin size={14} />
        <span>Illustrative map — demo restaurant locations</span>
      </div>
      {!compact && (
        <div className="map-note">
          <span className="origin-dot" /> Searching near{" "}
          <strong>{location.name}</strong>
          <small>
            Distances are straight-line estimates, not travel times.
          </small>
        </div>
      )}
    </div>
  );
}
