# Worked storyboard — Making drought losses visible

Version: 0.1 · Status: editorial demonstration · Owner: TBD

**This is a proposed sequence for discussion.** US$18 billion is the figure suggested for this exercise, not a verified drought loss estimate. Other missing facts are marked TBD. Filenames below are proposed asset names; those files have not been supplied. Draft reader copy requires evidence and editing before publication.

## Story brief

Audience: colleagues discussing how editorial ideas become a scroll story.

Question: how can a global loss figure be connected to geographic patterns and differences in loss composition?

Takeaway: a headline loss figure becomes more useful when readers can see its geography and composition.

Scope: global → India → Southeast Asia. India is in South Asia; the last comparison changes geography to Southeast Asia rather than widening an India-only dataset to its surrounding region.

Proposed ending: a static summary map and a link to the source data/methodology. Data contact and editorial reviewer: TBD.

## Sequence at a glance

| Order / beat | Reader takeaway | Visual | Scroll change |
| --- | --- | --- | --- |
| 1 / B01 | Start with the human context. | I01: opening photograph | Image and title appear. |
| 2 / B02 | Compare losses across hazards. | C01: horizontal bars | Chart appears with all hazards equally emphasised. |
| 3 / B03 | Focus on the proposed US$18bn drought figure. | Same C01 | Drought bar and value become prominent. |
| 4 / B04 | Locate drought average annual loss. | M01: MapX map | Chart leaves; global drought AAL layer appears. |
| 5 / B05 | Understand the composition of losses. | C02: pie + same M01 | Pie appears left of global map. |
| 6 / B06 | See the country comparison. | Same C02 + M01 | Map fits India; pie changes to India data. |
| 7 / B07 | Compare with a different regional scope. | Same C02 + M01 | Map moves out to Southeast Asia; pie redraws for that region. |
| 8 / B08 | Leave with a clear summary. | I02: static map | Interactive panels leave; static map and closing copy appear. |

## B01 — Opening photograph

| Reader copy | Visual / behaviour |
| --- | --- |
| **Title:** “The cost of drought” | Full-width photograph I01, with title and short introduction in a readable area. |
| **Body:** “How do we turn a headline loss figure into a clearer picture of risk?” | Crop around the agreed subject; keep the subject visible on phones. The image scrolls away as B02 enters. |
| **Credit:** TBD after the photo is chosen. | Proposed file: `drought-opening.jpg`. Final image, credit, alt text, and rights: TBD. |

Sketch / reference: [Insert candidate photograph and indicate where text can sit.]

## B02 — Establish the bar chart

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “Start with the bigger picture” | Show horizontal bar chart C01 and short copy. Keep C01 in place through B03. No MapX map yet. |
| **Body:** “Compare average annual losses across hazards.” | Dataset D01: hazard and global AAL in US$ billions; period, currency price basis, model, categories, and values TBD. Axis begins at zero. |
| **Source line:** “Illustrative data for editorial demonstration; source to be confirmed.” | At B02 all bars have equal emphasis, including drought. The final dataset must include drought; do not relabel a different hazard's bar. |

Sketch / reference: [Insert a rough chart showing category labels, value labels, and axis.]

## B03 — Draw attention to US$18 billion

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “Focus on drought” | Reuse C01 and D01 with exactly the same values, dimensions, category order, and axis. |
| **Body:** “US$18 billion in average annual drought losses.” **Illustrative claim — verify before publication.** | When this copy becomes active, emphasise the drought bar and add a visible “US$18 billion” annotation. Reduce emphasis on other bars while preserving legibility. |
| **Source line:** “Illustrative figure; not a verified estimate.” | Keep this state until B04. Returning to B02 restores equal emphasis. Reduced motion shows the final highlight immediately. |

Evidence needed: S01 must confirm that US$18bn refers to drought AAL, its geographic coverage, model/period, and currency basis. If unsupported, replace the figure in both data and copy.

## B04 — Show drought losses on MapX

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “Where are these losses concentrated?” | Replace C01 with a global MapX map M01; copy left, map right. Keep the map available through B07. |
| **Body:** “Explore the geographic pattern of average annual drought losses.” | Desired layer: drought average annual loss, not drought hazard or water stress. Project ID: **TBD**. View ID: **TBD**. Fit the available global coverage. |
| **Caption:** “[Dataset title, units, period/model, source — TBD.]” | Show the layer's legend and units; remove unrelated thematic layers. The mapped measure must be comparable with the chart or the difference must be explained. |

Sketch / reference: [Paste a MapX screenshot with its legend and the desired extent.]

Open question: data specialist to identify a suitable MapX layer and verify access. If unavailable, use an attributed static map or explicitly revise the story; do not present another metric as drought losses.

## B05 — Introduce a persistent pie chart

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “What makes up the total?” | Show pie C02 in the left panel, alongside M01 on the right. Put short narrative above the pie. Keep this arrangement through B07. |
| **Body:** “The composition of drought losses provides another way to understand the total.” | Proposed breakdown: drought AAL by economic sector. Dataset D02 must provide mutually exclusive, complete categories that sum to the total. Categories and values TBD. |
| **Caption:** “Global drought AAL by sector; total [TBD], period/model [TBD].” | Complete target: global map, M01 drought layer visible; C02 uses global D02 rows. Display geography, total, sector labels, and percentages. Keep sector colours/order consistent across B05–B07. |

Sketch / reference: [Left: copy + pie. Right: map + legend.]

Data decision: confirm that comparable global, India, and Southeast Asia sector data exist. If not, agree another supported breakdown before building. Do not invent sector shares.

## B06 — Zoom to India and update the same pie

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “Now look at India” | Retain C02 on the left and M01 on the right. Fit the map to India (`IND`); identify India clearly. |
| **Body:** “How does the composition change when we focus on India?” | Complete target: drought layer visible, India extent; C02 uses the India rows of D02. Update the chart title, total, values, and percentages together. Map movement alone does not change the chart dataset. |
| **Caption:** “India drought AAL by sector; total [TBD], same period/model.” | This is a camera focus, not necessarily a clipped map layer. Keep surrounding mapped data unless clipping is separately agreed. On returning to B05, restore global map and global pie. |

Desired transition: map and chart settle into their India state as one beat. If data are unavailable, show a clear “data unavailable” message rather than leaving a globally labelled or stale pie beside India.

## B07 — Move out to Southeast Asia and redraw

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “Compare with Southeast Asia” | Reuse C02 and M01. Zoom out and move the map to fit the agreed Southeast Asia countries. |
| **Body:** “Compare India's loss composition with a different regional grouping.” | Complete target: M01 drought layer visible over Southeast Asia; C02 uses the agreed regional aggregate in D02, with a new title and total. Retain sector colours and order. |
| **Caption:** “Southeast Asia drought AAL by sector; countries and period/model [TBD].” | Sum comparable sector loss amounts across the agreed countries, then calculate each share of the regional total. Do not average national percentages. Return to India data and map extent when scrolling up to B06. |

Open question: data specialist/editor to agree the exact country list, missing-country treatment, and comparability with India/global totals. The proposed camera in `src/config/regions.js` (`seAsia`) is a framing reference, not a definition of the dataset's membership.

## B08 — Static summary map and ending

| Reader copy | Visual / behaviour |
| --- | --- |
| **Heading:** “From a headline to a geographic story” | End the persistent map/pie section. Show full-width static map I02 with closing copy below. |
| **Body:** “Understanding both the location and composition of losses helps frame the questions we ask next.” | I02 should show the approved regional drought AAL map with clear title, geography, units, legend, and source credit. Proposed file: `drought-aal-southeast-asia.png`. |
| **Link:** “Read the data and methodology” → [TBD URL]. | Returning to B07 restores the interactive regional map and pie state. |

Sketch / reference: [Insert final static map or a rough labelled rectangle.]

## Shared phone and accessibility direction

For B01–B04 and B08, stack heading/copy, visual, then caption. For B05–B07, show copy, pie, then map in a single column; prefer a separate clearly labelled state for each beat on phones rather than squeezing two persistent panels onto the screen.

All states need a text summary and accessible source data. Label sectors directly or in a legend; colour alone should not carry the comparison. Use the final state immediately for reduced motion. If MapX fails to load, show an approved static fallback and preserve the takeaway in text. Fallback image assets and final alt text are still to be supplied.

## Asset and evidence register

| ID / beats | Proposed file or link | What must be supplied / status |
| --- | --- | --- |
| I01 / B01 | `drought-opening.jpg` | Photo, focal point, alt text, credit, rights; not supplied. |
| C01 / B02–B03 | Chart specification above; D01 | Horizontal bars; needs new persistent chart/highlight behaviour. |
| D01 / B02–B03 | `aal-by-hazard.csv` | Global hazard/AAL values, currency basis, period/model, source; not supplied. |
| S01 / B03 | Report URL and page/table: TBD | Verification or replacement of the US$18bn drought claim. |
| M01 / B04–B07 | MapX project + view links/IDs: TBD | Drought AAL metadata, legend, units, coverage, attribution, access check. |
| C02 / B05–B07 | Chart specification above; D02 | Same pie across three geographic states; needs new scroll-linked update behaviour. |
| D02 / B05–B07 | `drought-aal-by-sector-and-geography.csv` | Comparable sector amounts, global/India/regional scope, country list, aggregation, source; not supplied. |
| I02 / B08 | `drought-aal-southeast-asia.png` | Static summary map with metadata and credit; not supplied. |
| I03 / B04–B07 | `drought-aal-map-fallbacks/` | Approved global/India/regional stills with alt text; not supplied. |

All unresolved items need an assigned owner before handoff. The example is ready for an editorial planning demonstration; it is not ready for factual publication or implementation without those inputs.
