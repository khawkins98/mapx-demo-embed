/**
 * UI controls -- language, theme, dashboard, and display features.
 *
 * Language:
 *   set_language({lang})  -- switch interface language using ISO 639-1
 *                            codes (e.g. "en", "fr", "es", "ar")
 *   get_language()        -- returns current language code
 *   get_languages()       -- returns list of supported language codes
 *
 * Theme:
 *   set_theme({idTheme})  -- switch map visual theme
 *   get_themes_id()       -- returns available theme IDs
 *   get_theme_id()        -- returns current theme ID
 *
 * Dashboard:
 *   has_dashboard()       -- returns true if a dashboard panel is
 *                            currently available (dashboards are
 *                            attached to views that have chart/graph
 *                            widgets)
 *   set_dashboard_visibility({show})
 *                         -- opens or closes the dashboard slide-out
 *                            panel; also supports {toggle: true}
 *
 * Vector highlight:
 *   set_vector_highlight({enable})
 *     Enables or disables the click highlight ring on vector features.
 *     When enabled, clicking a feature shows a visual highlight and
 *     triggers click_attributes events through the SDK.
 */

import { getSDK } from "./client.js";

export function setLanguage(lang) {
  return getSDK().ask("set_language", { lang });
}

export function getLanguage() {
  return getSDK().ask("get_language");
}

export function setTheme(idTheme) {
  return getSDK().ask("set_theme", { idTheme });
}

export function getThemesId() {
  return getSDK().ask("get_themes_id");
}

export function getThemeId() {
  return getSDK().ask("get_theme_id");
}

export function hasDashboard() {
  return getSDK().ask("has_dashboard");
}

export function setDashboardVisibility(show) {
  return getSDK().ask("set_dashboard_visibility", { show });
}

export function setVectorHighlight(enable) {
  return getSDK().ask("set_vector_highlight", { enable });
}

/**
 * show_modal_map_composer()
 *   Opens the MapX map composer modal, which provides a full-featured
 *   map export tool (layout, title, legend, scale bar, north arrow).
 *   The entire UI is provided by MapX — no custom layout needed.
 */
export function showModalMapComposer() {
  return getSDK().ask("show_modal_map_composer");
}

/**
 * show_modal_share()
 *   Opens the MapX share modal, which provides sharing options
 *   including direct link, embed code, and social sharing buttons.
 *   The entire UI is provided by MapX.
 */
export function showModalShare() {
  return getSDK().ask("show_modal_share");
}

/**
 * close_modal_all()
 *   Closes all open MapX modals. Useful as a cleanup step.
 */
export function closeModalAll() {
  return getSDK().ask("close_modal_all");
}
