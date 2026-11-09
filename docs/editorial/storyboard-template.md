# Scrollytelling storyboard — [working title]

Version: [date / version] · Author: [name] · Editor: [name]

Status: [idea / drafting / editorial review / ready to build / prototype review]

## 1. Story brief

| Prompt                               | Fill in                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Who is this for?                     | [Audience and what they already know.]                                  |
| What question does the story answer? | [One question.]                                                         |
| What should readers take away?       | [One sentence.]                                                         |
| Why does it matter now?              | [Editorial reason for the story.]                                       |
| How does it end?                     | [Conclusion and any next action or link.]                               |
| Scope                                | [Geographies, time period, definitions, exclusions.]                    |
| Approximate length                   | [Reading time or number of beats; no need to estimate scroll pixels.]   |
| People and timing                    | [Story owner, data contact, designer/developer, reviewer, target date.] |

## 2. Sequence at a glance

One row per beat. Repeat a visual ID when the same chart or map continues. Keep beat IDs stable when reordering; change the order column instead.

| Order / beat ID | Reader takeaway     | Visual / asset IDs | What changes on scroll?      |
| --------------- | ------------------- | ------------------ | ---------------------------- |
| 1 / B01         | [Opening hook.]     | [Image I01.]       | [Image and headline appear.] |
| 2 / B02         | [First finding.]    | [Chart C01.]       | [Chart appears.]             |
| 3 / B03         | [Specific finding.] | [Same chart C01.]  | [One bar is highlighted.]    |
| [Continue]      | [...]               | [...]              | [...]                        |

## 3. Beat sheet — duplicate for each beat

### B[00] — [short descriptive name]

Takeaway: [The one thing a reader should understand here.]

Status / owner: [Draft / questions outstanding / agreed; responsible person.]

| Reader copy — words to publish                                                                        | Visual / behaviour — instructions to the team                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Heading:** [Exact proposed headline.]                                                               | **Show:** [Image, chart, MapX map, static map, video, text only, or combination; asset IDs.]                                   |
| **Body:** [Exact proposed text. Aim for a short paragraph; split it if there are two distinct ideas.] | **Layout:** [Full width / copy left and map right / chart left and map right / other. Say what stays visible while scrolling.] |
| **Caption / source line:** [Exact proposed wording.]                                                  | **On entry:** [What appears or changes when this beat becomes active? What remains? Describe the final state.]                 |
| **Link / button, if any:** [Label and destination.]                                                   | **On leaving / returning:** [When does this visual stop staying on screen? What should be restored on upward scrolling?]       |

**Sketch or reference image — optional**

[Paste an image here in Word, or sketch the arrangement. Plain words are enough.]

[In Markdown, use `![Reference description](relative/path/to/image.jpg)` once the file exists.]

Reference filename / shared link: [Exact filename or accessible link, even when a thumbnail is pasted.]

What the reference demonstrates: [Composition / crop / chart form / actual final asset.]

**Fill in only the relevant visual details**

| If using…        | Details                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image or video   | [Asset ID; crop/focal point; caption; credit. For video: playback/captions if relevant.]                                                                                                                      |
| Chart            | [Chart ID and type; data asset ID; fields/categories; value and unit; period; geography/filter; title; axes/legend; annotation or highlight. For pie/donut: what is the whole?]                               |
| Continuing chart | [Same chart ID; complete target dataset/filter; what changes and what remains consistent, including category colours, order, and axis scale.]                                                                 |
| MapX map         | [Map ID; project link/ID; view link/ID for each layer; layer order and visibility; legend/title; geography and any filter. Describe the desired map extent in words; coordinates/zoom can be supplied later.] |
| Map movement     | [Starting geography → target geography; what stays visible; whether the data filter also changes. Camera movement alone does not filter chart data.]                                                          |
| Static map       | [Image asset ID and filename; source dataset/period; extent; legend, labels, scale/credits as needed; image description.]                                                                                     |

**Phone, accessibility, and fallback**

- Phone layout: [Reading order and placement when side-by-side content cannot fit.]
- Text alternative: [Image alt text, or chart/map summary and link to data table.]
- Reduced motion / unavailable map: [Which still state or image and explanatory text preserve the takeaway?]
- Optional reader interaction: [Click/select behaviour, if any. The core message should remain understandable through scrolling.]

**Evidence and open questions**

- Source / claim IDs: [Link to the register below; say which source supports which statement.]
- To resolve: [Question → owner → needed by. Use TBD rather than inventing a figure or MapX ID.]
- Review note: [Editorial / data / design decision and date, if needed.]

## 4. Asset and evidence register

Use one row per image, dataset, map, or source. Suggested IDs: I = image, C = chart, D = data, M = map, S = source. A chart can reference a data asset; several beats can share a chart.

| ID / used in beats | File or URL / MapX project + view                                | Source, credit, rights                          | Data meaning / readiness / owner                                                                                        |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [I01 / B01]        | [Exact filename and shared folder link.]                         | [Creator; permission/license; required credit.] | [Final / reference only / to obtain; owner.]                                                                            |
| [D01 / B02–B03]    | [CSV/XLSX filename or stable source link; sheet/table.]          | [Publisher, source URL, version/access date.]   | [Measure, currency/unit, price basis if relevant, period, geography, fields, missing values; demo or validated; owner.] |
| [M01 / B04]        | [Project ID/link AND view ID/link; one row per layer if needed.] | [Publisher, metadata/source link, attribution.] | [Measure, units, period, scenario if relevant, coverage, access checked?; owner.]                                       |
| [S01 / B03]        | [Report URL and page/table supporting the claim.]                | [Publisher and publication date.]               | [Exact claim supported; checked by whom; unresolved caveat.]                                                            |

For regional charts, supply the included countries and aggregation method. Explain whether values are sums, weighted averages, shares, or something else. Keep modelled average annual loss distinct from losses observed in a particular year.

## 5. Handoff review

- [ ] The story has one central message and a clear ending.
- [ ] Each beat pairs publishable copy with a clear visual result.
- [ ] Reused charts/maps have stable IDs and explicit target states.
- [ ] Every numerical claim has a source, units, period, and geography; demonstration values are labelled.
- [ ] Files are findable; image credits/rights and MapX project/view details are recorded.
- [ ] Phone layout, text alternatives, and map/motion fallbacks are described.
- [ ] Open questions have owners, and the team knows which interactions need new development.

Reviewers / date / remaining decisions: [Fill in.]
