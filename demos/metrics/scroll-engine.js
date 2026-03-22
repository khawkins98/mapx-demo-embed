/**
 * Intersection Observer-based scroll engine for the Metrics Hub.
 *
 * Watches narrative cards and fires a callback when a card crosses
 * the viewport midpoint. The callback triggers map state changes
 * in main.js.
 */

let currentIndex = -1;
let observer = null;

/**
 * Initialise the scroll engine.
 *
 * @param {Object} opts
 * @param {string} opts.cardSelector   - CSS selector for narrative cards
 * @param {function(number): void} opts.onActivate - Called with the card index
 */
export function initScrollEngine({ cardSelector, onActivate }) {
  const cards = document.querySelectorAll(cardSelector);
  if (!cards.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          const index = Number(entry.target.dataset.index);
          if (index !== currentIndex) {
            currentIndex = index;
            onActivate(index);
          }
        }
      }
    },
    {
      threshold: [0.4, 0.6],
      rootMargin: "-10% 0px -40% 0px",
    },
  );

  cards.forEach((card) => observer.observe(card));
}

/** @returns {number} Current active section index */
export function getActiveSectionIndex() {
  return currentIndex;
}

/**
 * Programmatically scroll to a section.
 * @param {number} index
 */
export function scrollToSection(index) {
  const card = document.querySelector(`[data-index="${index}"]`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
