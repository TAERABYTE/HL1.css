document.querySelectorAll(".toggle-vision").forEach((button) => {
  button.addEventListener("click", () => {
    const block = button.closest(".code-block")?.querySelector(".inner");
    if (!block) return;

    block.classList.toggle("hidden");
    button.textContent = block.classList.contains("hidden")
      ? "Show code"
      : "Hide code";
  });
});

/* -------------------------------------------------------
   Code Block: Copy to Clipboard
------------------------------------------------------- */
document.querySelectorAll(".inner .hl-btn").forEach((button) => {
  let timeoutId = null;

  button.addEventListener("click", async () => {
    const codeEl = button.closest(".inner")?.querySelector("code");
    if (!codeEl) return;

    try {
      await navigator.clipboard.writeText(codeEl.textContent.trim());
      button.textContent = "Copied!";

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => (button.textContent = "Copy"), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  });
});

/* -------------------------------------------------------
   Utility: make any element draggable
------------------------------------------------------- */
function makeDraggable(el, handle) {
  if (!el || !handle) return;

  handle.style.cursor = "move";

  handle.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    // don't start dragging when the initial target is an interactive element
    // (so buttons/links/inputs inside the header remain clickable)
    const interactiveSelector =
      "button, a, input, textarea, select, [role='button'], .no-drag";
    if (ev.target instanceof Element && ev.target.closest(interactiveSelector))
      return;
    ev.preventDefault();

    const rect = el.getBoundingClientRect();
    const offsetX = ev.clientX - rect.left;
    const offsetY = ev.clientY - rect.top;

    el.style.position = "fixed";
    el.style.margin = "0";

    const onMove = (e) => {
      const vw = innerWidth;
      const vh = innerHeight;
      const dRect = el.getBoundingClientRect();

      const left = Math.min(Math.max(e.clientX - offsetX, 0), vw - dRect.width);
      const top = Math.min(Math.max(e.clientY - offsetY, 0), vh - dRect.height);

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;

      el.dataset.moved = "true"; // Mark as dragged
      el.style.transform = ""; // Remove centering transform
    };

    const onUp = () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
    };

    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
  });
}

/* -------------------------------------------------------
   <dialog> draggable support
------------------------------------------------------- */
function makeDialogDraggable(dialog) {
  // prefer an explicit drag handle inside the heading so interactive
  // elements (buttons) inside the heading remain clickable
  const handle =
    dialog?.querySelector(".heading .drag-handle") ??
    dialog?.querySelector(".heading");
  if (!handle) return;

  makeDraggable(dialog, handle);

  // support both explicit id (#dialog-close) and class (.close)
  const closeBtn = dialog.querySelector(
    ".heading #dialog-close, .heading .close"
  );
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    // close() exists on HTMLDialogElement
    try {
      dialog.close?.();
    } catch (err) {
      // fallback: hide attribute if custom handling
      console.error("Dialog close failed:", err);
    }
  });
}

// ensure Escape closes native dialogs and hides custom modal overlay
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  // close any open <dialog.hl-dialog>
  document.querySelectorAll("dialog.hl-dialog").forEach((d) => {
    try {
      if (typeof d.open === "boolean" ? d.open : d.hasAttribute("open")) {
        d.close?.();
      }
    } catch {
      // ignore
    }
  });

  // hide custom overlay if visible
  const overlay = document.getElementById("hl-modal-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   // เปิดใช้งานการลากสำหรับทุก dialog
//   document.querySelectorAll(".hl-dialog").forEach((dialog) => {
//     makeDialogDraggable(dialog);
//   });
// });

/* -------------------------------------------------------
   Custom modal (.hl-modal)
------------------------------------------------------- */
(() => {
  const overlay = document.getElementById("hl-modal-overlay");
  if (!overlay) return;

  const modal = overlay.querySelector(".hl-modal");
  const header = modal?.querySelector(".heading");

  const openBtn = document.getElementById("open-modal");
  const closeBtn = document.getElementById("modal-close");
  const okBtn = document.getElementById("modal-ok");
  const cancelBtn = document.getElementById("modal-cancel");

  /* --- Center modal every time it opens --- */
  const resetModalPos = () => {
    modal.dataset.moved = "false";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.position = "fixed";
  };

  const showModal = () => {
    resetModalPos(); // center every time
    overlay.classList.remove("hidden");
  };

  const hideModal = () => {
    overlay.classList.add("hidden");
  };

  openBtn?.addEventListener("click", showModal);
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hideModal();
  });
  okBtn?.addEventListener("click", hideModal);
  cancelBtn?.addEventListener("click", hideModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideModal();
  });

  if (modal && header) {
    makeDraggable(modal, header);
  }
})();
