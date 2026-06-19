"use client";

import { motion, AnimatePresence } from "framer-motion";

export function TypingIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-end gap-2"
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm shadow-sm">
            🤖
          </div>

          {/* Bubble */}
          <div className="flex h-9 items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
