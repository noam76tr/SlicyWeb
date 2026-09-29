/**
 * Wichy
 * Viewport
 *
 * Responsible for:
 * - Renderer container
 * - 3D viewport hosting
 * - Renderer lifecycle
 *
 * No business logic.
 * No AI logic.
 * No analysis logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import {
  useEffect,
  useRef,
} from "react";

import { Renderer } from "../../renderer/Renderer";

export default function Viewport(): JSX.Element {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const renderer =
      new Renderer();

    renderer.attach(container);

    const handleResize = (): void => {
      renderer.resize(
        container.clientWidth,
        container.clientHeight,
      );
    };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-neutral-900"
    />
  );
}
