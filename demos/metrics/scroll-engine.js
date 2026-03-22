/**
 * Intersection Observer-based scroll engine for the Metrics Hub.
 *
 * Uses a "trigger strip" pattern: a narrow observation band at ~25–45%
 * from the top of the viewport. When a card enters this strip, it
 * becomes the active section.
 *
 * Cards are identified by their `data-section` attribute (a semantic ID
 * like "global-hazard") rather than a numeric index, so the wiring
 * doesn't break when sections are reordered or added.
 */

let currentSectionId = null;
let observer = null;

/**
 * Initialise the scroll engine.
 *
 * @param {Object} opts
 * @param {string} opts.cardSelector - CSS selector for narrative cards
 * @param {function(string): void} opts.onActivate
 *   Called with the section ID (data-section attribute) when a card
 *   enters the trigger strip.
 */
export function initScrollEngine({ cardSelector, onActivate }) {
  const cards = document.querySelectorAll(cardSelector);
  if (!cards.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      let bestId = null;
      let bestRatio = -1;

      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestId = entry.target.dataset.section;
        }
      }

      if (bestId && bestId !== currentSectionId) {
        currentSectionId = bestId;
        onActivate(bestId);
      }
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    },
  );

  cards.forEach((card) => observer.observe(card));
}

/** @returns {string|null} Current active section ID */
export function getActiveSectionId() {
  return currentSectionId;
}

/**
 * Programmatically scroll to a section by ID.
 * @param {string} sectionId
 */
export function scrollToSection(sectionId) {
  const card = document.querySelector(`[data-section="${sectionId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
