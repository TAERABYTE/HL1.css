(function () {
  "use strict";

  /* -------------------------------------------------------
     Show and Hide code
  ------------------------------------------------------- */
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
     Modal System - Event Delegation
  ------------------------------------------------------- */
  
  // Track how many modals are currently open
  let openModalCount = 0;

  // Event delegation - จับ clicks ที่ document level
  document.addEventListener("click", function (e) {
    const target = e.target;

    // เปิด Modal
    const openAttr = target.getAttribute("data-hl-modal-open");
    if (openAttr) {
      e.preventDefault();
      openModal(openAttr);
      return;
    }

    // ปิด Modal - ปุ่ม close
    const closeAttr = target.getAttribute("data-hl-modal-close");
    if (closeAttr) {
      e.preventDefault();
      closeModal(closeAttr);
      return;
    }

    // ปิด Modal - คลิก overlay
    if (target.classList.contains("hl-modal-overlay")) {
      const modalId = target.getAttribute("data-hl-modal-id");
      if (modalId) {
        closeModal(modalId);
      }
    }
  });

  // ESC key
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;

    // Close any open .hl-modal-overlay
    const openModals = document.querySelectorAll(
      ".hl-modal-overlay:not(.hidden)"
    );
    openModals.forEach((overlay) => {
      const modalId = overlay.getAttribute("data-hl-modal-id");
      if (modalId) closeModal(modalId);
    });

    // Close any open <dialog.hl-dialog>
    document.querySelectorAll("dialog.hl-dialog").forEach((d) => {
      try {
        if (typeof d.open === "boolean" ? d.open : d.hasAttribute("open")) {
          d.close?.();
        }
      } catch {
        // ignore
      }
    });
  });

  /* -------------------------------------------------------
     Modal Functions
  ------------------------------------------------------- */
  
  function openModal(modalId) {
    const overlay = document.querySelector(`[data-hl-modal-id="${modalId}"]`);
    if (!overlay) {
      console.warn(`Modal "${modalId}" not found`);
      return;
    }

    const modal = overlay.querySelector(".hl-modal");
    if (!modal) return;

    // Reset position
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.position = "fixed";

    // Show
    overlay.classList.remove("hidden");
    
    openModalCount++;

    // Setup draggable ถ้ายังไม่ได้ setup
    if (!modal.dataset.draggable) {
      const header = modal.querySelector(".heading, [data-hl-modal-header]");
      if (header) {
        makeDraggable(modal, header);
        modal.dataset.draggable = "true";
      }
    }

    // Focus trap
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }

  function closeModal(modalId) {
    const overlay = document.querySelector(`[data-hl-modal-id="${modalId}"]`);
    if (!overlay) return;

    overlay.classList.add("hidden");
    
    openModalCount = Math.max(0, openModalCount - 1);
  }

  function makeDraggable(el, handle) {
    if (!el || !handle) return;

    handle.style.cursor = "move";

    handle.addEventListener("pointerdown", function (ev) {
      if (ev.button !== 0) return;

      const interactiveSelector =
        'button, a, input, textarea, select, [role="button"], .no-drag, [data-hl-modal-close]';
      if (
        ev.target instanceof Element &&
        ev.target.closest(interactiveSelector)
      ) {
        return;
      }

      ev.preventDefault();

      const rect = el.getBoundingClientRect();
      const offsetX = ev.clientX - rect.left;
      const offsetY = ev.clientY - rect.top;

      el.style.position = "fixed";
      el.style.margin = "0";

      function onMove(e) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const dRect = el.getBoundingClientRect();
        const left = Math.min(
          Math.max(e.clientX - offsetX, 0),
          vw - dRect.width
        );
        const top = Math.min(
          Math.max(e.clientY - offsetY, 0),
          vh - dRect.height
        );

        el.style.left = left + "px";
        el.style.top = top + "px";
        el.style.transform = "";
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }

  /* -------------------------------------------------------
     Public API
  ------------------------------------------------------- */
  
  window.HLModal = {
    open: openModal,
    close: closeModal,
  };

  console.log("HL1 CDN loaded ✓");
})();