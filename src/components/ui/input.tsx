"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  className?: string;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const letterVariants = {
  initial: {
    y: 0,
    color: "inherit",
  },
  animate: {
    y: "-120%",
    color: "var(--manga-muted)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export const Input = ({
  label,
  className = "",
  value,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-manga-muted text-sm font-medium pl-3"
        variants={containerVariants}
        initial="initial"
        animate={showLabel ? "animate" : "initial"}
      >
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block text-sm"
            variants={letterVariants}
            style={{ willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>

      <input
        type="text"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        {...props}
        className="outline-none border border-manga-border rounded-lg px-4 py-3 w-full text-base font-medium text-manga-text bg-manga-surface placeholder-transparent focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-shadow"
      />
    </div>
  );
};

export const Textarea = ({
  label,
  className = "",
  value,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, value: string }) => {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="absolute top-4 left-0 -translate-y-1/2 pointer-events-none text-manga-muted text-sm font-medium pl-4"
        variants={containerVariants}
        initial="initial"
        animate={showLabel ? "animate" : "initial"}
      >
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block text-sm"
            variants={letterVariants}
            style={{ willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>

      <textarea
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        {...props}
        className="outline-none border border-manga-border rounded-lg px-4 py-3 w-full text-base font-medium text-manga-text bg-manga-surface placeholder-transparent focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-shadow resize-none"
      />
    </div>
  );
};
