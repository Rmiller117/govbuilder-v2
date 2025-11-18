// src/motion.ts
export const fade = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 300 } },
  leave: { opacity: 0, transition: { duration: 200 } }
}

export const slideFade = {
  initial: { opacity: 0, x: 50 },
  enter: { opacity: 1, x: 0, transition: { duration: 400, ease: 'easeOut' } },
  leave: { opacity: 0, x: -50, transition: { duration: 300 } }
}