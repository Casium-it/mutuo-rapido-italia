
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, Building2, Sparkles, Calculator, Check, File } from "lucide-react";

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
}

export function PathOption({ 
  title, 
  description, 
  keyPoints,
  ctaLabel,
  variant 
}: PathOptionProps) {
  return (
    <Card className={`shadow-sm hover-grow ${
      variant === "primary" 
        ? "border border-vibe-green/30 bg-white" 
        : "bg-vibe-green-light/50 animated-border"
    } w-full max-w-sm`}>
      <CardHeader className={`${
        variant === "primary" 
          ? "bg-white border-b border-vibe-green/10" 
          : "bg-gradient-to-r from-vibe-green-light to-vibe-green/10 border-b border-vibe-green/20"
      } rounded-t-lg pb-3`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl font-bold ${variant === "secondary" ? "text-vibe-green" : "text-gray-700"}`}>
            {title}
          </CardTitle>
          <Badge variant={variant === "primary" ? "outline" : "default"} className={
            variant === "primary" 
              ? "border-gray-400 text-gray-600 hover:bg-gray-100" 
              : "bg-vibe-green text-white hover:bg-vibe-green/90"
          }>
            {variant === "primary" ? "Base" : "Consigliato"}
          </Badge>
        </div>
        <CardDescription className={`text-sm pt-1 ${variant === "secondary" ? "text-gray-700" : "text-gray-500"}`}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <div className={`rounded-full p-1 flex-shrink-0 ${
                variant === "primary" 
                  ? "text-vibe-green bg-vibe-green/10" 
                  : "text-vibe-green bg-vibe-green/20"
              } mt-0.5`}>
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
          className={`w-full font-medium ${
            variant === "primary" 
              ? "border border-vibe-green bg-white text-vibe-green hover:bg-vibe-green/5" 
              : "bg-vibe-green text-white hover:bg-vibe-green-dark"
          }`}
          size="sm"
          onClick={() => variant === "secondary" ? window.location.href = "/simulazione-avanzata" : null}
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
