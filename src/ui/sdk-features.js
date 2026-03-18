import { log } from "./log.js";
import { setLanguage, getLanguage, setTheme, getThemesId, getThemeId } from "../sdk/ui.js";
import { playStoryMap } from "./story-overlay.js";

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
