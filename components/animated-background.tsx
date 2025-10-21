"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Squares = dynamic(() => import("@/components/Squares"), { ssr: false });

export function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="fixed inset-0 z-0">
      <Squares 
        speed={0.08}
        squareSize={50}
        direction="diagonal"
        borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.03)"}
        hoverFillColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"}
        gradientColor="none"
      />
    </div>
  );
}

