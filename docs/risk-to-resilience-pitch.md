# Risk to Resilience Metrics — Pitch & Story Arc

## Audience

| Stakeholder | Key Decision | What They Need |
|-------------|-------------|----------------|
| Governments | Prioritize resilience investments | National hazard exposure, fiscal risk, sectoral vulnerabilities |
| Banks | Integrate physical risk in lending | Hazard exposure to assets, macroeconomic shock risk |
| Insurance | Identify emerging risk & protection gaps | Hazard trends, sector exposure |
| Credit rating agencies | Assess sovereign risk | Disaster losses relative to GDP and debt |
| Private investors | Identify resilient investment opportunities | Sectoral exposure + resilience opportunities |

## The Problem

Every year, disasters cause over **$200 billion** in direct economic losses
globally. Yet most decision-makers lack access to simplified, spatially
explicit risk analytics that translate probabilistic hazard science into
financial signals they can act on.

The gap is not data — it is **translation**. Risk models exist. Exposure
databases exist. What is missing is an interface that connects them to the
decisions that governments, lenders, and investors actually make.

## Framework: Hazard → Exposure → Vulnerability → Resilience

The platform is structured around four pillars of disaster risk:

1. **Hazard** — What natural hazards threaten a location? (floods, cyclones,
   earthquakes, landslides, tsunamis, drought)
2. **Exposure** — Who and what is in harm's way? (population density, built
   environment, agriculture, critical infrastructure)
3. **Vulnerability** — How susceptible are exposed assets and communities?
   (structural fragility, poverty, governance capacity)
4. **Resilience** — What reduces risk? (early warning systems, insurance
   penetration, nature-based solutions, fiscal buffers)

## Scrollytelling Arc

The interactive experience guides users through five narrative sections.
Each section follows a **Tell → Quantify → Show** rhythm: narrative text
introduces the concept, inline charts quantify the stakes, and the map
reveals the spatial dimension.

### Section 1: "The Global Hazard Landscape"

**Narrative:** Disasters are not random — they follow geographic patterns
dictated by tectonics, climate, and topography. Floods alone account for
42% of global average annual loss (AAL), followed by tropical cyclones (28%)
and earthquakes (18%).

**Chart:** Horizontal bar chart — AAL by hazard type ($ billions)

**Map state:** Global view with flood hazard (25-year return period) and
tropical cyclone exposure layers overlaid.

**Key message:** Risk is concentrated, not uniform. The same regions face
compounding hazards.

### Section 2: "Population at Risk"

**Narrative:** Hazard is only half the equation. Risk emerges where hazards
intersect with people. Over 1.8 billion people live in areas with
significant flood exposure, concentrated in South and Southeast Asia's
river deltas and coastal lowlands.

**Chart:** Metric cards — 1.81B people exposed, 40+ countries with >10%
population at risk, $4.2T assets in flood zones

**Map state:** Population density (HRSL 2022) overlaid with flood hazard
at 40% transparency, camera flies to South Asia.

**Key message:** Exposure is growing as urbanization pushes people into
hazard-prone areas.

### Section 3: "Counting the Cost"

**Narrative:** For Small Island Developing States and least developed
countries, disaster losses can exceed 5% of GDP annually — enough to
erase years of development gains. The Caribbean alone faces $3.2 billion
in average annual losses from cyclones and flooding, yet less than 30%
of losses are insured.

**Chart:** Stacked bar — insured vs. uninsured losses for top-10 most
exposed countries (% GDP)

**Map state:** Population + cyclone exposure at 40% transparency, camera
flies to Caribbean.

**Key message:** The protection gap — the difference between total and
insured losses — is largest where countries can least afford it.

### Section 4: "Nature's Shield"

**Narrative:** Ecosystem-based approaches offer cost-effective risk
reduction. Intact forests reduce downstream flood peaks by up to 20%.
Coastal mangroves attenuate cyclone storm surge, protecting an estimated
$65 billion in property annually. Every $1 invested in nature-based
solutions yields $4–7 in avoided losses.

**Chart:** Horizontal bar — cost-benefit ratio of NbS investments
(forest protection, mangrove restoration, wetland conservation)

**Map state:** Forest protection (flood risk reduction) and mangrove
restoration (cyclone surge) layers, camera on Southeast Asia coast.

**Key message:** Nature is infrastructure. Protecting ecosystems is one
of the highest-return resilience investments available.

### Section 5: "Climate Outlook"

**Narrative:** Climate change is a risk multiplier. Under RCP 8.5, water
stress is projected to intensify across the Middle East, North Africa,
and Central Asia by 2030. Cyclone intensity is increasing. Sea level
rise amplifies coastal flood and storm surge exposure for hundreds of
millions.

**Chart:** Trend line — projected increase in water stress index
(2020 → 2030 → 2050)

**Map state:** Water stress change (RCP 8.5, 2030) vector layer,
global view.

**Key message:** Adaptation investment now is cheaper than recovery later.
The window for proactive resilience-building is narrowing.

## Country Deep Dive

After the scrollytelling arc, users can explore individual country risk
profiles. The deep-dive section includes:

- **Country selector** — searchable dropdown of 10 pilot countries
- **Risk score** — composite 0–100 index combining hazard, exposure,
  and vulnerability indicators
- **AAL metrics** — average annual loss as % of GDP and in USD
- **Hazard breakdown** — donut chart showing contribution by hazard type
- **Sectoral exposure** — bar chart of agriculture, housing,
  infrastructure, commercial exposure
- **Resilience indicators** — early warning coverage, insurance
  penetration, ecosystem protection scores
- **Map integration** — selecting a country flies the map to that country
  and activates relevant hazard layers

### Pilot Countries

Nepal (NPL), Philippines (PHL), Bangladesh (BGD), Haiti (HTI),
Mozambique (MOZ), Indonesia (IDN), India (IND), Pakistan (PAK),
Fiji (FJI), Madagascar (MDG)

Selected to represent diverse risk profiles across Asia-Pacific, Caribbean,
and Africa — covering earthquake, flood, cyclone, and landslide hazards.

## Stakeholder Pathways

Four pathway cards guide different audiences to the tools most relevant
to their decisions:

1. **Governments** — Country resilience profiles, fiscal risk metrics,
   investment prioritization tools
2. **Banks & Insurance** — Asset exposure analytics, protection gap
   analysis, climate risk projections
3. **Investors** — Sectoral resilience opportunities, NbS cost-benefit
   data, ESG-aligned risk metrics
4. **Researchers** — Open datasets via MapX, API access, methodology
   documentation

## Data Sources & Caveats

- **Hazard layers:** MapX Eco-DRR project (MX-2LD-FBB-58N-ROK-8RH) --
  authoritative UNEP/GRID-Geneva datasets
- **Country metrics:** Synthetic data for demonstration purposes,
  calibrated to approximate published figures from GAR, CRED EM-DAT,
  and World Bank sources
- **Charts:** Mock visualizations with plausible values -- not for
  policy use without validation against primary sources
- **Platform concept:** Designed for FCDO project stakeholder review;
  production version would integrate live APIs and validated datasets

## Level of Certainty

The stakeholder document was a rough strategy brief, not a detailed
spec. Below is what was explicitly stated vs what was inferred to build
a coherent demo.

### High certainty -- directly from the document

These elements were explicitly described or named in the stakeholder
notes:

- **Target audiences**: governments, banks, insurance, credit rating
  agencies, private investors -- these were listed by name
- **Platform components**: landing website, metrics hub with
  storytelling, country resilience notes, interactive explorer --
  the document named these as distinct products
- **Key requirements**: "simplified interfaces", "clear storytelling",
  "decision-relevant metrics", "intuitive navigation" -- direct quotes
  or close paraphrases from meeting notes
- **Risk-to-resilience framing**: the document centered on translating
  risk analytics into actionable financial signals
- **Storytelling-to-map flow**: "all stories will finish by the map
  visualization" -- explicitly stated as a design principle
- **Country deep-dives**: the document described searchable country
  profiles as a core feature
- **Nature-based solutions**: mentioned as a key theme for resilience
  investment narratives

### Medium certainty -- reasonably inferred

These were not explicitly specified but follow logically from the
stated requirements and the UNDRR/FCDO context:

- **Four-pillar framework** (Hazard/Exposure/Vulnerability/Resilience):
  this is the standard DRR framework (Sendai) -- the document talked
  about risk components without naming this exact structure, but it is
  the obvious framing for this audience
- **AAL/PML/GDP-at-risk metrics**: the document mentioned
  "decision-relevant metrics" and "financial signals" without listing
  specific indicators -- AAL and PML are the standard financial risk
  metrics used by insurers and governments
- **Scrollytelling format**: the document described a blend of
  storytelling + maps but did not prescribe scrollytelling
  specifically -- it was chosen as the best interaction pattern to
  deliver the "narrative that ends at the map" requirement
- **Stakeholder pathway cards**: the document described tailored
  experiences per audience but did not specify the card-based UI --
  cards were chosen as a simple way to surface per-audience value
- **Pilot country selection** (NPL, PHL, BGD, etc.): the document
  did not name specific countries -- these were chosen to represent
  diverse risk profiles across the regions the FCDO project covers
- **Protection gap / insured vs uninsured framing**: the document
  mentioned insurance stakeholders and fiscal risk but did not call
  out the protection gap explicitly -- it is the central concept for
  insurance/banking audiences

### Lower certainty -- creative interpretation to fill gaps

These elements were invented to make the demo feel complete. They
would need stakeholder validation:

- **Specific chart types and data values**: all numbers (1.81B
  exposed, $4.2T assets, NbS ROI ratios) are synthetic mockups
  calibrated to published ranges -- the document did not specify
  what charts to show
- **Tell/Quantify/Show rhythm**: the three-beat narrative pattern per
  section was a design choice -- the document described blending
  narrative with maps but did not prescribe this specific cadence
- **Interactive metric cards** (click-to-explore on map): entirely
  invented as a demo interaction to show how charts and maps could
  be linked -- not mentioned in the document
- **Climate outlook section**: the document mentioned climate as a
  risk multiplier but did not describe a dedicated climate projection
  section -- added to showcase the water stress data available in MapX
- **Resilience indicators** (early warning, insurance, ecosystem
  scores): the document described resilience broadly -- these three
  dimensions were chosen as representative, not prescribed
- **CTA section with GRAR/MapX/PreventionWeb links**: the document
  did not specify downstream actions -- these links reflect the
  UNDRR product ecosystem and seemed natural
- **Dual map instances** (scrollytelling + country deep-dive): a
  technical choice to solve the layout problem of the sticky map
  not being visible in the country section
