/** Initialise the PIN gate overlay. Call once on page load. */
export function initPinGate() {
  const PIN = "5498";
  const gate = document.getElementById("pin-gate");
  const input = document.getElementById("pin-input");
  const error = document.getElementById("pin-error");

  if (localStorage.getItem("mapx-demo-pin") === "ok") {
    gate.remove();
    return;
  }

  input.focus();
  input.addEventListener("input", function () {
    error.textContent = "";
    if (input.value.length === 4) {
      if (input.value === PIN) {
        localStorage.setItem("mapx-demo-pin", "ok");
        gate.style.transition = "opacity 0.3s";
        gate.style.opacity = "0";
        setTimeout(() => gate.remove(), 300);
      } else {
        error.textContent = "Incorrect PIN";
        input.value = "";
      }
    }
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && input.value.length === 4) {
      input.dispatchEvent(new Event("input"));
    }
  });
}
