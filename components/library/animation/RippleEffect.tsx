"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RippleEffectProps {
  children?: ReactNode;
  className?: string;
  rippleColor?: string;
  duration?: number;
  maxRipples?: number;
  size?: "sm" | "md" | "lg" | "auto";
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  startTime: number;
}

export const RippleEffect = ({
  children,
  className,
  rippleColor = "rgba(255, 255, 255, 0.6)",
  duration = 600,
  maxRipples = 3,
  size = "auto",
  disabled = false,
}: RippleEffectProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdCounter = useRef(0);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-24 h-24";
      case "md":
        return "w-48 h-48";
      case "lg":
        return "w-72 h-72";
      default:
        return "w-full h-full";
    }
  };

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: Ripple = {
      id: rippleIdCounter.current++,
      x,
      y,
      startTime: Date.now(),
    };

    setRipples((prev) => {
      const updated = [...prev, newRipple];
      // Keep only the most recent ripples
      return updated.slice(-maxRipples);
    });

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, duration);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer select-none",
        getSizeClasses(),
        className,
      )}
      onMouseDown={createRipple}
    >
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              width: "400px",
              height: "400px",
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
