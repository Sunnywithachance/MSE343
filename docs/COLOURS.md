# Plateful original colour inventory

> **Archived palette:** This reference captures the original teal design, before the yellow UI redesign. Current theme colours are defined in `src/theme.css`: red `#D63B35`, pale red `#FFF0EE`, charcoal `#292A27`, white `#FFFFFF`, and warm backgrounds `#FAFAF8` / `#FCFCFA`.

167 distinct hexadecimal colour values are declared across the interface, map, restaurant artwork, and page metadata. White spellings (`white`, `#fff`, `#FFFFFF`) are combined. This lists source colours, including alpha variants; antialiasing and blending create additional pixels on screen.

The first table contains the main colours to choose when changing the overall theme. Other sections cover every additional declared shade. Some colours are reused in multiple places; usages are listed together. No colours were changed.

Open [the visual swatch palette](colour-palette.html) to see the colours beside their codes.


## Core interface palette

| Colour | Where it is used |
| --- | --- |
| `#263633` | Main body text |
| `#F7F7F0` | Main page background |
| `#087C86` | Primary teal: logo, buttons, links, focus rings, selected map markers |
| `#234A45` | Dark teal: headings, branding, toast background |
| `#66736F` | Muted / secondary text |
| `#E4E7DE` | Default borders and dividers |
| `#DFEAE4` | Pale sage: count badges |
| `#FFFFFF` | Cards, panels, button text, map roads |

## Dietary status, warnings and evidence

| Colour | Where it is used |
| --- | --- |
| `#FFF3DF` | .match-badge → background; .uncertain-heading → background |
| `#91632A` | .match-badge → color |
| `#EDF3E9` | .match-badge.full → background |
| `#47724D` | .match-badge.full → color |
| `#F2E7E2` | .match-badge.none → background |
| `#955A41` | .match-badge.none → color |
| `#47795B` | .status.supported → color |
| `#996721` | .status.unknown, .status.partial → color; .uncertain-heading → color |
| `#9D604C` | .status.unsupported → color |
| `#EEDEC1` | .uncertain-heading → border |
| `#FFF4E1` | .callout → background |
| `#8B662E` | .callout → color |
| `#F0E4CD` | .callout → border |
| `#A54735` | .error → color |
| `#946622` | .warning-text → color |
| `#DCE5D6` | .prototype-note → border |
| `#F3F6EF` | .prototype-note → background |
| `#648064` | .prototype-note → color |
| `#F5EBD8` | .provenance → background |
| `#947032` | .provenance → color |
| `#E7EFE3` | .provenance.independent → background |
| `#5B8051` | .provenance.independent → color |
| `#F2EEE4` | .provenance.unknown → background |
| `#8A7960` | .provenance.unknown → color |
| `#A8BCA0` | .certificate → border |
| `#5D7B52` | .certificate → color |

## Additional surfaces, borders and selection states

| Colour | Where it is used |
| --- | --- |
| `#F5F8F4` | .profile-nav:hover → background |
| `#7E9D68` | .eyebrow > span → background |
| `#DCE2D4` | .intro-note → border-left |
| `#DCE2D8` | .search-form → border |
| `#78A8A4` | .search-form:focus-within → border-color |
| `#056872` | .filter-button:hover, .primary:hover → background |
| `#DDE2D5` | .chip, .quiet-chip → border |
| `#EDF0E7` | .chip, .quiet-chip → background |
| `#E5EEEA` | .chip.dietary → background |
| `#CFDFD7` | .chip.dietary → border-color |
| `#DCE7DE` | .chip:hover → background |
| `#E0E4D8` | .map-shell → border |
| `#559282` | .map-marker → border; .map-marker:after → border-right; .map-marker:after → border-bottom |
| `#B1874A` | .map-marker.partial → border-color |
| `#A86A24` | .map-marker.partial.selected → background |
| `#E2E6DB` | .map-caption → border-top |
| `#F9FAF5` | .map-caption → background; .empty-state → background |
| `#E6ECDF` | .trust-icon → background |
| `#E1E5DA` | .restaurant-card → border |
| `#88B4A7` | .restaurant-card.selected → border-color |
| `#E6EBD7` | .card-visual → background |
| `#EDF0E8` | .card-bottom → border-top |
| `#CFDCD4` | .secondary → border |
| `#EDF3EC` | .secondary:hover → background |
| `#EEF2E9` | .icon-button:hover → background |
| `#CDD8C8` | .empty-state → border |
| `#E5EDDF` | .empty-state > span → background |
| `#DCE4D8` | .search-suggestions → border |
| `#EFF4ED` | .search-suggestions > button:hover → background |
| `#E2E8DC` | .drawer → border-left |
| `#FAFBF7` | .dialog-header → background; .meal-evidence → background |
| `#EAF0E6` | .filter-section h3 > span → background |
| `#EFF2EB` | .segmented → background |
| `#DFE6D9` | .choice → border |
| `#8DAE9F` | .choice:hover → border-color |
| `#E6F0EB` | .choice.chosen → background |
| `#79AAA0` | .choice.chosen → border-color |
| `#F3F7F1` | .halal-options → background |
| `#D9E1D3` | .field input, .field select, .field textarea → border |
| `#E8F0E8` | .range-label strong → background |
| `#E1E7DC` | .radio-card → border |
| `#91B3A4` | .radio-card:has(input:checked) → border-color |
| `#F6F9F3` | .radio-card:has(input:checked) → background |
| `#DCE3D6` | .mode-card → border |
| `#EFF5EB` | .mode-card.active → background |
| `#8AAF95` | .mode-card.active → border-color |
| `#E5EFDF` | .profile-intro > span → background |
| `#F4F7EE` | .meal-suggestion → background |
| `#E6EADD` | .meal-evidence → border |
| `#EDF0E6` | .info-row → border-bottom |
| `#F7F9F3` | .contact-info → background |

## Additional text, icons and accents

| Colour | Where it is used |
| --- | --- |
| `#6F8274` | .eyebrow → color |
| `#688068` | .intro-note → color |
| `#7A8781` | .search-form input::placeholder → color |
| `#7E9682` | .search-location svg → color |
| `#839087` | .filter-caption → color |
| `#28675E` | .chip.dietary → color |
| `#2D7164` | .map-marker → color |
| `#966225` | .map-marker.partial → color |
| `#6E7E70` | .map-caption → color |
| `#68865E` | .trust-icon → color |
| `#7A8278` | .match-legend → color |
| `#3A7563` | .match-legend span:first-child → color |
| `#A1AAA0` | .restaurant-meta > span → color |
| `#7D8981` | .card-diet-details small → color |
| `#43715C` | .plain-diet → color |
| `#879084` | .results-footnote → color |
| `#899184` | .site-footer → color |
| `#677A6F` | .icon-button → color |
| `#64796A` | .empty-state → color |
| `#668A65` | .empty-state > span → color |
| `#739070` | .filter-section h3 > span → color |
| `#6E7E6E` | .segmented button → color |
| `#5A6F60` | legend → color |
| `#236E66` | .choice.chosen → color |
| `#4E6758` | .field → color |
| `#356E5A` | .range-label strong → color |
| `#8A9785` | .range-ends → color |
| `#81907F` | fieldset > small → color |
| `#6A8C65` | .profile-intro > span → color |
| `#82917C` | .menu-row small → color |

## Illustrative map

| Colour | Where it is used |
| --- | --- |
| `#EEF0E6` | Map base |
| `#DBE5D0` | Parks / green spaces |
| `#DEDFD4` | Street outlines |
| `#C0DCE0` | Water / river |
| `#E9DCBB` | Main-road centres |
| `#899487` | Map labels |
| `#8CA57A` | Trees (also rendered at 50% opacity) |

## Restaurant illustration backgrounds

| Colour | Where it is used |
| --- | --- |
| `#DCE7C2` | Green Bowl Kitchen illustration background |
| `#F1D2AD` | Saffron House illustration background |
| `#D4E2CC` | Cedar & Olive illustration background |
| `#D9E5D2` | Lotus Garden illustration background |
| `#E7C9B3` | Maple Hearth Bistro illustration background |
| `#EFC89D` | Spice Route Kitchen illustration background |
| `#E2E6BE` | Garden Table Café illustration background |
| `#D9B99A` | Harbor Street Grill illustration background |
| `#E6D5B6` | Noodle & Grain illustration background |
| `#E9C1A8` | Sunset Trattoria illustration background |

## Food illustrations

| Colour | Where it is used |
| --- | --- |
| `#FDFBF1` | Plate rim |
| `#CB7239` | Curry base |
| `#E4D9AD` | Rice / grain base |
| `#D4C9A5` | Plate outline |
| `#EAB57D` | Curry ingredients |
| `#5B833E` | Dark leaves |
| `#88A54A` | Light leaves |
| `#F4E8B4` | Ingredient veins (40% opacity) |
| `#EFBC75` | Curry centre |
| `#E7B35C` | Bowl centre |
| `#F5E4B0` | Noodles |
| `#F3D497` | Grains |
| `#F9EEE0` | Sauce lines |
| `#426F3C` | Herb garnish |
| `#CA6449` | Tomato outer |
| `#E69771` | Tomato centre |
| `#967758` | Chopsticks |

## Transparency, overlays and shadows

| Colour | Where it is used |
| --- | --- |
| `#234A4503` | .search-form → box-shadow |
| `#087C8609` | .search-form:focus-within → box-shadow |
| `#234A451C` | .map-marker → box-shadow |
| `#087C8616` | .map-marker.selected, .map-marker:hover → box-shadow |
| `#087C861A` | .origin-pin → box-shadow |
| `#FFFFFFF0` | .origin-pin label → background |
| `#234A4509` | .restaurant-card.selected → box-shadow |
| `#FFFFFFF2` | .card-map-index → background |
| `#FFFEF7ED` | .save-button → background |
| `#234A45A8` | .illustration-label → color; .detail-food > span → color |
| `#FFFFFF82` | .illustration-label → background |
| `#2636331A` | .search-suggestions → box-shadow |
| `#17332918` | .drawer → box-shadow |
| `#20342D59` | .drawer::backdrop → background |
| `#26363303` | .dialog-footer → box-shadow |
| `#26493509` | .segmented .active → box-shadow |
| `#234A4533` | .toast → box-shadow |
| `#FFFFFF88` | .detail-food > span → background |

## Transparency notes

Eight-digit hex codes use `#RRGGBBAA`; the last two digits set opacity. `transparent` is also used for clear surfaces and tap highlights. SVG illustration colours additionally use opacity attributes: white at 16%, dark teal `#234A45` at 12%, pale yellow `#F4E8B4` at 40%, and map-tree green `#8CA57A` at 50%. Parent/disabled states can reduce opacity further. `currentColor` icons inherit their surrounding text colour.

## Source files

- `src/index.css`: interface styles and interaction states
- `src/components/RestaurantMap.tsx`: SVG map colours
- `src/components/shared.tsx`: food illustration colours
- `src/data/restaurants.ts`: restaurant illustration backgrounds
- `index.html`: browser theme and favicon (same primary teal and white)
