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
