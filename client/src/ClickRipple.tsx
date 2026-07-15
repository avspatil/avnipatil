import { useEffect } from "react";

const RING_COUNT = 1;
const DURATION = 1800;
const RING_DELAY = 1000;

const ClickRipple: React.FC = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, a, button, .admin-page, .admin-login")) return;

      const container = document.createElement("div");
      container.style.cssText = `
        position:fixed; left:${e.clientX}px; top:${e.clientY}px;
        width:0; height:0; pointer-events:none; z-index:500;
      `;
      document.body.appendChild(container);

      for (let i = 0; i < RING_COUNT; i++) {
        const ring = document.createElement("div");
        const delay = i * RING_DELAY;
        ring.style.cssText = `
          position:absolute; top:0; left:0; transform:translate(-50%,-50%);
          width:300px; height:300px; border-radius:50%;
          border:1.5px solid rgba(255,191,0,0.35);
          opacity:0; pointer-events:none;
          animation:ripple-ring ${DURATION}ms ${delay}ms ease-out forwards;
        `;
        container.appendChild(ring);
      }

      setTimeout(() => container.remove(), DURATION + (RING_COUNT - 1) * RING_DELAY + 50);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
};

export default ClickRipple;
