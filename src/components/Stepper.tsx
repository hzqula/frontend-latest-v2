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
    <div className={cn("w-full py-4", className)}>
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
                    <motion.div
                      className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 0.9, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <div className="w-5 h-5 sm:w-7 sm:h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium">
                      {index + 1}
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium transition-colors",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="sm:w-4 sm:h-4"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                )}

                {/* Step Label - Hidden on extra small screens but visible from sm breakpoint */}
                <span
                  className={cn(
                    "hidden sm:block text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium max-w-[60px] sm:max-w-[80px] text-center",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>

                {/* Mobile Number Only - Shown only on xs screens */}
                <span
                  className={cn(
                    "sm:hidden text-[9px] mt-1 font-medium",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center max-w-16 sm:max-w-full">
                  <div className="h-[1px] sm:h-[2px] w-full flex relative -mt-[16px] sm:-mt-[20px]">
                    <motion.div
                      className="bg-primary h-full"
                      initial={{ width: isCompleted ? "100%" : "0%" }}
                      animate={{
                        width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                    <div
                      className={cn(
                        "h-full",
                        isCompleted ? "w-0" : isCurrent ? "w-1/2" : "w-full",
                        "bg-muted"
                      )}
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
