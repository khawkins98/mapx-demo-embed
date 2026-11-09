# Planning a scroll story

Use a **scrollytelling storyboard** (or **story script**) to plan the experience before building it. The useful unit is a **beat**: one reader takeaway paired with a visual state. A new beat can reuse the same chart or map and change only its emphasis, data, or location.

There is no single universal manuscript format. For this project, use a short story brief, an overview of the sequence, and a repeatable beat sheet pairing **reader copy / visual direction**. This adapts the two-column audiovisual script to a reader-controlled story.

## Start here

Editable Word versions: [planning guide](planning-guide.docx), [blank template](storyboard-template.docx), and [worked example](storyboard-example.docx). The Markdown files remain available for editing in the repository.

1. Copy [the blank template](storyboard-template.md) for a new story.
2. Write the audience, central message, and ending first.
3. List the beats in order. Describe them in ordinary language; sketches are optional.
4. Fill out one beat sheet per change. Separate publishable copy from instructions such as “zoom to India.”
5. Collect images, source data, and MapX links in the asset register. Use stable asset IDs so a replacement file does not require rewriting every beat.
6. Review the narrative with an editor, the figures with a data specialist, and the interactions with a designer/developer. Then review a working prototype together.

[The worked example](storyboard-example.md) follows the proposed image → bar chart → highlighted loss → drought map → pie chart → India → Southeast Asia → static map sequence. It describes a proposed story, not an account of everything already implemented.

## How to describe a change

Write “Keep chart C01 visible; emphasise the drought bar and label US$18 billion; leave the axis unchanged.” That is more actionable than “animate the chart.” Give the desired result first. Developers can decide how to implement it.

Make a new beat when the reader should notice a new thing. Showing a bar chart and subsequently highlighting one bar are two beats, even though they use the same chart. Conversely, a map zoom and chart update can belong to one beat when they communicate the same geographic comparison.

For each beat, say what stays, what changes, and what the reader should see at the end. Include the complete target state in map/chart details, so returning to a beat or scrolling quickly produces the same result. Readers control the pace; seconds are optional animation notes, not a reading timer.

A thumbnail helps communicate composition, but the filename or shared asset link is still required. For a chart, a screenshot is a reference: the underlying data and source are also needed if it will be redrawn or updated.

## Relationship to this proof of concept

The scroll-based starting point is the [Metrics Hub](../../demos/metrics/index.html). The separate [Risk to Resilience story](../../demos/story/index.html) uses Previous/Next navigation.

| Editorial instruction                      | Current implementation / handoff                                                                                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beat identity and sequence                 | Metrics sections use stable `id` values in [metrics-sections.js](../../src/config/metrics-sections.js), matched by HTML `data-section` attributes.                          |
| Headline and reader copy                   | The current Metrics Hub has visible narrative copy in its HTML as well as narrative in configuration; implementation must keep them aligned.                                |
| Chart type, data, units                    | Section configuration supports horizontal bars, stacked bars, donuts, trend lines, and metric cards, rendered by [charts.js](../../demos/metrics/charts.js).                |
| Map layers and geography                   | Sections specify `views`, `camera`, and optional `transparency`; [main.js](../../demos/metrics/main.js) applies these on activation.                                        |
| When a beat activates                      | The [scroll engine](../../demos/metrics/scroll-engine.js) activates cards in a band about 25–45% down the viewport. Editors can simply say “when this text becomes active.” |
| Persistent chart that changes across beats | Requires additional implementation. Current narrative charts are rendered into separate cards at page load.                                                                 |
| Highlight a bar on scroll                  | Requires additional implementation. Current bar/metric actions are click or keyboard driven map actions.                                                                    |
| Image hero, static map, custom composition | Treat as layout/asset requests for implementation; they are not fields automatically consumed by the section configuration.                                                 |

The Markdown is an editorial handoff document. It is not currently imported by the app. No drought average annual loss layer is identified in the curated view list in [views.js](../../src/config/views.js); its project, view ID, metadata, and availability need checking before implementation. Do not substitute water stress, hazard, or exposure for economic loss.

The existing [pitch](../risk-to-resilience-pitch.md) identifies its chart values and country metrics as demonstration data. Carry that distinction into any presentation to colleagues.

## Later Word version

Use the same content, with a brief and sequence overview at the front, then one beat sheet per page. Each sheet should have a two-column table headed **Reader copy** and **Visual / behaviour**, followed by a generous box for a pasted image or sketch and a short asset/source strip. Allow the copy area to grow if needed.

Keep images inline in table cells, put filenames and captions below thumbnails, and repeat the beat ID in the page heading. Use landscape pages only if the chosen sketch or comparison needs the width. A single very wide table containing the whole story is harder to edit and leaves little space for images. This Markdown version deliberately uses small tables and separate sketch areas so that conversion is straightforward.

## Background reading

- [SIUE IRIS Center: Scrollytelling Tutorial](https://iris.siue.edu/humanities-futures/curriculum/scrollytelling-tutorial/) explicitly recommends storyboarding and dividing a story into steps pairing text and media.
- [Flourish: How to create a scrolly using the story editor](https://helpcenter.flourish.studio/hc/en-us/articles/8761522702991-How-to-create-a-scrolly-using-the-story-editor) illustrates building a sequence of visualisations and captions.
- [Shorthand: An introduction to scrollytelling](https://shorthand.com/the-craft/an-introduction-to-scrollytelling/index.html) describes scroll-triggered multimedia and sequential reveals.

The template here is a proposed house format informed by these practices, not a formal industry standard.
