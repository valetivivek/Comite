import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface MagnetizeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
  isLoading?: boolean;
  idleLabel?: string;
  activeLabel?: string;
  loadingLabel?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

function MagnetizeButton({
  className,
  particleCount = 12,
  isLoading = false,
  idleLabel = "Surprise Me",
  activeLabel = "Surprise Me",
  loadingLabel = "Rolling...",
  ...props
}: MagnetizeButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesControl = useAnimation();

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 180, // Constrain to button width approx
      y: (Math.random() - 0.5) * 30,  // Constrain to button height approx
    }));
    setParticles(newParticles);
  }, [particleCount]);

  const handleInteractionStart = useCallback(async () => {
    setIsAttracting(true);
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10,
      },
    });
  }, [particlesControl]);

  const handleInteractionEnd = useCallback(async () => {
    setIsAttracting(false);
    await particlesControl.start((i) => ({
      x: particles[i]?.x ?? 0,
      y: particles[i]?.y ?? 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }));
  }, [particlesControl, particles]);

  const label = isLoading ? loadingLabel : isAttracting ? activeLabel : idleLabel;

  return (
    <Button
      className={cn(
        "w-full relative touch-none overflow-hidden",
        "bg-manga-accent/10 hover:bg-manga-accent/20",
        "text-manga-accent",
        "border border-manga-accent/30",
        "transition-all duration-300",
        "rounded-lg h-11",
        isLoading && "opacity-60 cursor-not-allowed",
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      disabled={isLoading}
      {...props}
    >
      {particles.map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          initial={{ x: particles[index]?.x ?? 0, y: particles[index]?.y ?? 0 }}
          animate={particlesControl}
          className={cn(
            "absolute w-1.5 h-1.5 rounded-full",
            "top-1/2 left-1/2",
            "-ms-0.5 -mt-0.5", // Center origin tuning
            "bg-manga-accent",
            "transition-opacity duration-300",
            isAttracting ? "opacity-80" : "opacity-30"
          )}
        />
      ))}
      <span className="relative w-full flex items-center justify-center gap-2">
        <Sparkles
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isAttracting && "scale-110",
            isLoading && "animate-spin"
          )}
        />
        {label}
      </span>
    </Button>
  );
}

export { MagnetizeButton };
