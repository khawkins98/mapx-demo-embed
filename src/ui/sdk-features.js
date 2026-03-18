import { log } from "./log.js";
import { setLanguage, getLanguage, setTheme, getThemesId, getThemeId } from "../sdk/ui.js";
import { playStoryMap } from "./story-overlay.js";

/**
 * Wire up the SDK feature controls: language, theme, and story maps.
 *
 * Language switching:
 *   The buttons use ISO 639-1 two-letter codes (en, fr, es, de, ru, zh,
 *   ar). set_language changes labels, legends, and metadata inside the
 *   MapX iframe. We read get_language on startup to highlight whichever
 *   button matches the current state.
 *
 * Theme switching:
 *   Theme buttons are built dynamically — we call get_themes_id to fetch
 *   the list of available theme IDs from the MapX instance, then create
 *   a button for each. The IDs look like "color_default", "color_dark",
 *   etc.; we strip the "color_" prefix and title-case the rest for the
 *   button label. get_theme_id tells us which one is active so we can
 *   mark it with is-active on load.
 *
 * Story map buttons:
 *   These call playStoryMap() which opens an overlay iframe (see
 *   story-overlay.js for the rationale). The story views belong to
 *   a different project, so they can't be loaded via view_add on
 *   our SDK instance.
 */
export async function enableSdkFeatures() {
  /* Language buttons */
  document.querySelectorAll(".btn-lang").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lang = btn.dataset.lang;
      log(`Switching language to: ${lang}`);
      await setLanguage(lang);
      document.querySelectorAll(".btn-lang").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  try {
    const currentLang = await getLanguage();
    log(`Current language: ${currentLang}`);
    const activeBtn = document.querySelector(`.btn-lang[data-lang="${currentLang}"]`);
    if (activeBtn) activeBtn.classList.add("is-active");
  } catch (e) {
    log("get_language: " + e.message);
  }

  /* Theme buttons */
  try {
    const themeIds = await getThemesId();
    const currentTheme = await getThemeId();
    log(`Available themes: ${themeIds.join(", ")}`);
    log(`Current theme: ${currentTheme}`);

    const container = document.getElementById("theme-buttons");
    container.innerHTML = "";

    themeIds.forEach((id) => {
      const btn = document.createElement("button");
      btn.className = "mg-button mg-button-secondary";
      const label = id.replace(/^color_/, "").replace(/_/g, " ");
      btn.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      if (id === currentTheme) btn.classList.add("is-active");

      btn.addEventListener("click", async () => {
        log(`Switching theme to: ${id}`);
        await setTheme(id);
        container.querySelectorAll(".mg-button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });

      container.appendChild(btn);
    });
  } catch (e) {
    log("Themes: " + e.message);
  }

  /* Story map buttons */
  document.getElementById("btn-story-mapx").addEventListener("click", () => {
    playStoryMap("MX-5BWRN-RBB0W-ZAXRA", "MapX Presentation");
  });

  document.getElementById("btn-story-caribbean").addEventListener("click", () => {
    playStoryMap("MX-YF1T2-42JUK-5EXLM", "Caribbean Sea");
  });
}
