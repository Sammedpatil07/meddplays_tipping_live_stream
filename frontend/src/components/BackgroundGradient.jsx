import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// 🎨 Auto-cycling color palettes — [bottom-left, top-right, bottom-right, top-left]
const COLOR_PALETTES = [
  ["#00ccb1", "#7b61ff", "#ffc414", "#1ca0fb"], // Aceternity default (teal/purple/gold/blue)
  ["#8b5cf6", "#ec4899", "#a855f7", "#6366f1"], // MEDDplays purple/pink
  ["#ff6b00", "#ff0080", "#ffcc00", "#ff4500"], // Fire 🔥
  ["#00d4ff", "#0070f3", "#00ffaa", "#7928ca"], // Ocean 🌊
  ["#ffd700", "#ff6b00", "#ffc414", "#ff9500"], // Gold Gaming 🏆
  ["#ff0080", "#7928ca", "#ff4d4d", "#f9cb28"], // Candy 🍬
  ["#00ff87", "#60efff", "#0061ff", "#00ff87"], // Neon Green/Blue
]

function buildGradient(colors) {
  const [c1, c2, c3, c4] = colors
  return (
    `radial-gradient(circle farthest-side at 0 100%,${c1},transparent),` +
    `radial-gradient(circle farthest-side at 100% 0,${c2},transparent),` +
    `radial-gradient(circle farthest-side at 100% 100%,${c3},transparent),` +
    `radial-gradient(circle farthest-side at 0 0,${c4},transparent)`
  )
}

const animVariants = {
  initial: { backgroundPosition: "0 50%" },
  animate: { backgroundPosition: ["0 50%", "100% 50%", "0 50%"] },
}

const animTransition = {
  duration: 6,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
}

export function BackgroundGradient({
  children,
  colors,
  cycleColors = true,
  cycleInterval = 4500,
  fadeDuration = 2.0,
  style = {},
  containerStyle = {},
  animate = true,
  borderRadius = "28px",
}) {
  const [paletteIndex, setPaletteIndex] = useState(0)

  // Auto-cycle through palettes
  useEffect(() => {
    if (!cycleColors || colors) return
    const id = setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % COLOR_PALETTES.length)
    }, cycleInterval)
    return () => clearInterval(id)
  }, [cycleColors, cycleInterval, colors])

  const activeColors = colors || COLOR_PALETTES[paletteIndex]
  const GRADIENT = buildGradient(activeColors)

  const sharedMotionProps = animate
    ? { variants: animVariants, initial: "initial", animate: "animate", transition: animTransition }
    : {}

  return (
    <div
      className="bg-gradient-group"
      style={{ position: "relative", padding: "4px", ...containerStyle }}
    >
      {/* Cross-fading blurred glow layer */}
      <AnimatePresence>
        <motion.div
          key={`glow-${colors ? "static" : paletteIndex}`}
          {...sharedMotionProps}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: fadeDuration, ease: "easeInOut" },
            ...animTransition,
          }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRADIENT,
            backgroundSize: animate ? "400% 400%" : undefined,
            borderRadius,
            zIndex: 1,
            filter: "blur(22px)",
            willChange: "transform, opacity",
          }}
        />
      </AnimatePresence>

      {/* Cross-fading sharp gradient border layer */}
      <AnimatePresence>
        <motion.div
          key={`border-${colors ? "static" : paletteIndex}`}
          {...sharedMotionProps}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: fadeDuration, ease: "easeInOut" },
            ...animTransition,
          }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRADIENT,
            backgroundSize: animate ? "400% 400%" : undefined,
            borderRadius,
            zIndex: 2,
            willChange: "transform, opacity",
          }}
        />
      </AnimatePresence>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          borderRadius: `calc(${borderRadius} - 4px)`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
