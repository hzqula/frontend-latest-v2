"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full pt-6", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;
          const isPending = currentStep < index + 1;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                {isCurrent ? (
                  <motion.div
                    className="relative flex items-center justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Pulse effect */}
                    <motion.div
                      className="absolute w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.7, 0.3, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Outer ring */}
                    <motion.div
                      className="absolute w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary rounded-full"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />

                    {/* Step number */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shadow-md",
                      isCompleted
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="sm:w-5 sm:h-5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 360] }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                )}

                {/* Step Label */}
                <motion.span
                  className={cn(
                    "text-xs sm:text-sm mt-2 sm:mt-3 font-medium max-w-16 sm:max-w-24 text-center",
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {step}
                </motion.span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center max-w-16 sm:max-w-full">
                  <div className="h-[3px] sm:h-[4px] w-full flex relative -mt-[20px] sm:-mt-[24px] rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary/90 to-primary h-full rounded-full"
                      initial={{ width: isCompleted ? "100%" : "0%" }}
                      animate={{
                        width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                    <motion.div
                      className="h-full bg-muted"
                      initial={{ width: isCompleted ? "0%" : "100%" }}
                      animate={{
                        width: isCompleted ? "0%" : isCurrent ? "50%" : "100%",
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
