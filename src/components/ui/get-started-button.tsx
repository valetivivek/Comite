import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export interface GetStartedButtonProps extends ButtonProps {
  label?: string;
}

export const GetStartedButton = React.forwardRef<HTMLButtonElement, GetStartedButtonProps>(
  ({ label = "Get Started", children, className, ...props }, ref) => {
    return (
      <Button ref={ref} className={`group relative overflow-hidden ${className || ""}`} size="lg" {...props}>
        <span className="mr-6 transition-opacity duration-300 group-hover:opacity-0 relative z-20">
          {children || label}
        </span>
        <i className="absolute right-1 top-1 bottom-1 rounded-md z-10 grid w-8 place-items-center transition-all duration-300 bg-black/20 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-current not-italic">
          <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
        </i>
      </Button>
    );
  }
);

GetStartedButton.displayName = "GetStartedButton";
