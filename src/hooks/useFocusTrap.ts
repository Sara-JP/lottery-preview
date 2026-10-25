import { useEffect } from "react"
import type { RefObject } from "react"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab/Shift+Tab focus within `containerRef` while `active` is true, and
 * restores focus to whatever was focused before the dialog opened once it
 * closes. Without this, a keyboard-only user can Tab straight out of an open
 * ConfirmDialog/NotesDrawer into the page behind it — the dialog LOOKS modal
 * but isn't, for anyone not using a mouse.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    function handleKeydown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !containerRef.current) return
      const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        el => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeydown)
    return () => {
      document.removeEventListener("keydown", handleKeydown)
      previouslyFocused?.focus?.()
    }
  }, [active, containerRef])
}
