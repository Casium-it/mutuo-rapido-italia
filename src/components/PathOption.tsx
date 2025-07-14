
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface KeyPoint {
  icon: React.ElementType;
  text: string;
  highlight?: string;
}

interface PathOptionProps {
  title: string;
  description: string;
  keyPoints: KeyPoint[];
  ctaLabel: string;
  variant: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}

export function PathOption({ 
  title, 
  description, 
  keyPoints,
  ctaLabel,
  variant,
  onClick,
  disabled = false
}: PathOptionProps) {
  return (
    <Card className={`relative transition-all duration-300 ${
      disabled 
        ? "opacity-60 cursor-not-allowed" 
        : "hover-grow"
    } ${
      variant === "primary" 
        ? "border border-[#BEB8AE] bg-white shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]" 
        : "bg-[#F8F4EF] border-2 border-[#245C4F] shadow-[0_3px_0_0_#1a3f37] hover:shadow-[0_3px_4px_rgba(26,63,55,0.25)]"
    } w-full max-w-sm rounded-[12px]`}>
      {variant === "secondary" && (
        <Badge variant="outline" className="absolute -top-3 right-0 bg-[#245C4F] text-white border-[#245C4F] hover:bg-[#1e4f44] hover:border-[#1e4f44] z-10">
          Consigliato
        </Badge>
      )}
      <CardHeader className={`${
        variant === "primary" 
          ? "bg-white border-b border-[#BEB8AE]" 
          : "bg-gradient-to-r from-[#F8F4EF] to-[#F0EAE0] border-b border-[#245C4F]"
      } rounded-t-[10px] pb-3`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl font-bold ${variant === "secondary" ? "text-[#245C4F]" : "text-gray-700"}`}>
            {title}
          </CardTitle>
        </div>
        <CardDescription className={`text-sm pt-1 ${variant === "secondary" ? "text-gray-700" : "text-gray-500"}`}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-center gap-2.5">
              <div className={`rounded-full p-1 flex-shrink-0 ${
                variant === "primary" 
                  ? "text-[#245C4F] bg-[#F8F4EF]" 
                  : "text-[#245C4F] bg-white"
              }`}>
                <point.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-xs text-gray-700">
                {point.highlight ? (
                  <span>
                    <span className="font-semibold">{point.highlight}</span> {point.text}
                  </span>
                ) : (
                  point.text
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center pb-4">
        <Button 
          className={`w-full font-medium px-[32px] py-[16px] text-[16px] rounded-[12px] transition-all ${
            disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300 shadow-none"
              : variant === "primary" 
                ? "border border-[#245C4F] bg-white text-[#245C4F] hover:bg-[#F8F4EF] shadow-[0_3px_0_0_#AFA89F] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#AFA89F]" 
                : "bg-[#245C4F] text-white hover:bg-[#1e4f44] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37]"
          }`}
          size="sm"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
