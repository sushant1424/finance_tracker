"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const FlipWords = ({
  words,
  intervalMs = 1800,
  className = "",
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, words.length]);

  return (
    <span className={className}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="inline-block text-blue-600"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
