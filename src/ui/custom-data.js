import { log } from "./log.js";
import * as store from "../state/store.js";
import { fieldOfficesGeoJSON } from "../data/field-offices.js";
import { monitoringStationsGeoJSON } from "../data/monitoring-stations.js";
import { projectZonesGeoJSON } from "../data/project-zones.js";
import { viewGeojsonCreate, viewGeojsonSetStyle, viewGeojsonDelete } from "../sdk/views.js";
import { addSource, addLayer, removeLayer, removeSource } from "../sdk/map-layers.js";
import { mapFlyTo, commonLocFitBbox } from "../sdk/map-control.js";
import { updateAnalysisViewSelect } from "./analysis/view-select.js";

/**
 * Two approaches for adding custom data to the MapX map:
 *
 * Approach 1 — view_geojson_create (SDK-managed)
 *   Used for: DRR Field Offices, DRR Project Zones
 *   The SDK creates a proper MapX view from your GeoJSON. It appears in
 *   the view list inside the MapX iframe, gets an idView you can pass to
 *   other SDK methods (view_geojson_set_style, view_geojson_delete), and
 *   click_attributes events will fire with the feature's properties in
 *   data.attributes. This is the easier path — MapX handles rendering,
 *   click detection, and cleanup. The trade-off is limited styling: you
 *   get Mapbox paint properties but not layout or data-driven expressions.
 *
 * Approach 2 — map() passthrough (parent-controlled)
 *   Used for: Monitoring Stations
 *   Calls map.addSource and map.addLayer directly on the underlying
 *   Mapbox GL instance inside the iframe. This gives you full control
 *   over Mapbox styling — data-driven colors (match expressions), symbol
 *   layers with custom fonts, etc. The trade-off: MapX doesn't know the
 *   layer exists. It won't appear in the view list, click_attributes
 *   won't include feature properties (because MapX doesn't own the layer),
 *   and you have to clean up sources/layers yourself on removal.
 *
 *   To make click detection work for passthrough layers, we call
 *   store.registerGeoJSON(sourceId, geojson) after adding the source.
 *   This stores the GeoJSON data locally so that when a click_attributes
 *   event arrives with empty attributes but valid coordinates, the
 *   infobox handler can fall back to findNearestFeature() and search
 *   the registry by coordinate proximity. Without this registration
 *   step, clicks on passthrough layers would show nothing.
 */
export function enableCustomData() {
  /* GeoJSON View: DRR Field Offices */
  document.getElementById("btn-geojson-add").addEventListener("click", async () => {
    if (store.geojsonViewId) { log("GeoJSON view already added"); return; }

    log("Creating GeoJSON view: DRR Field Offices...");
    try {
      const result = await viewGeojsonCreate({
        data: fieldOfficesGeoJSON,
        title: { en: "DRR Field Offices (demo)" },
        abstract: { en: "Fictional field office locations for demonstration purposes." },
        random: false,
      });

      if (result && result.id) {
        store.setGeojsonViewId(result.id);
        log(`GeoJSON view created: ${store.geojsonViewId}`);
        store.registerGeoJSON(store.geojsonViewId, fieldOfficesGeoJSON);

        await viewGeojsonSetStyle(store.geojsonViewId, {
          "circle-radius": 8,
          "circle-color": "#c10920",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        });
        log("Styled with Sendai red circles");
        updateAnalysisViewSelect();
      }
    } catch (e) {
      log("GeoJSON create error: " + e.message);
    }
  });

  document.getElementById("btn-geojson-remove").addEventListener("click", async () => {
    if (!store.geojsonViewId) { log("No GeoJSON view to remove"); return; }
    log(`Removing GeoJSON view: ${store.geojsonViewId}`);
    store.unregisterGeoJSON(store.geojsonViewId);
    await viewGeojsonDelete(store.geojsonViewId);
    store.setGeojsonViewId(null);
    document.getElementById("infobox").style.display = "none";
    updateAnalysisViewSelect();
  });

  /* Mapbox Passthrough: Monitoring Stations */
  document.getElementById("btn-markers-add").addEventListener("click", async () => {
    if (store.markersAdded) { log("Monitoring stations already added"); return; }

    log("Adding monitoring stations via Mapbox passthrough...");
    try {
      await addSource(store.MARKERS_SOURCE, { type: "geojson", data: monitoringStationsGeoJSON });
      log("Source added");

      await addLayer({
        id: store.MARKERS_LAYER,
        type: "circle",
        source: store.MARKERS_SOURCE,
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "match", ["get", "type"],
            "Air Quality", "#00afae",
            "Water Level", "#004f91",
            "Seismic", "#eb752a",
            "Coastal", "#962987",
            "#808080",
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });
      log("Circle layer added with data-driven colors");

      await addLayer({
        id: store.MARKERS_LABEL_LAYER,
        type: "symbol",
        source: store.MARKERS_SOURCE,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, -1.5],
          "text-anchor": "bottom",
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });
      log("Label layer added");

      store.setMarkersAdded(true);
      store.registerGeoJSON(store.MARKERS_SOURCE, monitoringStationsGeoJSON);
      await commonLocFitBbox("UKR", { duration: 2000 });
    } catch (e) {
      log("Mapbox passthrough error: " + e.message);
    }
  });

  document.getElementById("btn-markers-remove").addEventListener("click", async () => {
    if (!store.markersAdded) { log("No markers to remove"); return; }
    log("Removing monitoring stations...");
    try {
      await removeLayer(store.MARKERS_LABEL_LAYER);
      await removeLayer(store.MARKERS_LAYER);
      await removeSource(store.MARKERS_SOURCE);
      store.unregisterGeoJSON(store.MARKERS_SOURCE);
      store.setMarkersAdded(false);
      log("Monitoring stations removed");
      document.getElementById("infobox").style.display = "none";
    } catch (e) {
      log("Remove error: " + e.message);
    }
  });

  /* Polygon Overlay: DRR Project Zones */
  document.getElementById("btn-polygons-add").addEventListener("click", async () => {
    if (store.polygonViewId) { log("Polygon layer already added"); return; }

    log("Creating GeoJSON polygon view: DRR Project Zones...");
    try {
      const result = await viewGeojsonCreate({
        data: projectZonesGeoJSON,
        title: { en: "DRR Project Zones (demo)" },
        abstract: { en: "Fictional project zones for demonstration purposes." },
        random: false,
      });

      if (result && result.id) {
        store.setPolygonViewId(result.id);
        log(`Polygon view created: ${store.polygonViewId}`);

        await viewGeojsonSetStyle(store.polygonViewId, {
          "fill-color": "#962987",
          "fill-opacity": 0.25,
          "fill-outline-color": "#962987",
        });
        log("Styled with Sendai purple fill");
        store.registerGeoJSON(store.polygonViewId, projectZonesGeoJSON);
        await mapFlyTo({ center: { lng: 60, lat: 15 }, zoom: 2.5 });
        updateAnalysisViewSelect();
      }
    } catch (e) {
      log("Polygon create error: " + e.message);
    }
  });

  document.getElementById("btn-polygons-remove").addEventListener("click", async () => {
    if (!store.polygonViewId) { log("No polygon layer to remove"); return; }
    log(`Removing polygon view: ${store.polygonViewId}`);
    store.unregisterGeoJSON(store.polygonViewId);
    await viewGeojsonDelete(store.polygonViewId);
    store.setPolygonViewId(null);
    document.getElementById("infobox").style.display = "none";
    updateAnalysisViewSelect();
  });
}
