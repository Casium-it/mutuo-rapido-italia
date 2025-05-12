
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, File, Clock, Percent, Building2, Sparkles } from "lucide-react";

interface KeyPoint {
  icon: React.ElementType;
  text: string;
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
    <Card className={`shadow-md hover-grow ${
      variant === "primary" 
        ? "border border-gray-200" 
        : "border-2 border-vibe-purple/50 ring-2 ring-vibe-purple/10"
    } w-full max-w-sm`}>
      <CardHeader className={`${
        variant === "primary" 
          ? "bg-gray-50" 
          : "bg-gradient-to-r from-vibe-purple/10 to-vibe-purple/5"
      } rounded-t-lg pb-4`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl font-bold ${variant === "secondary" ? "text-vibe-purple" : ""}`}>
            {title}
          </CardTitle>
          <Badge variant={variant === "primary" ? "outline" : "default"} className={
            variant === "primary" 
              ? "border-gray-400 text-gray-600 hover:bg-gray-100" 
              : "bg-vibe-purple text-white hover:bg-vibe-purple/90"
          }>
            {variant === "primary" ? "Base" : "Consigliato"}
          </Badge>
        </div>
        <CardDescription className="text-sm pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className={`rounded-full p-1 mt-0.5 ${
                variant === "primary" 
                  ? "text-vibe-green bg-vibe-green/10" 
                  : "text-vibe-purple bg-vibe-purple/10"
              }`}>
                <point.icon className="h-3 w-3" />
              </div>
              <span className="text-xs">{point.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center pb-4">
        <Button 
          className={`w-full font-medium ${
            variant === "primary" 
              ? "bg-vibe-green hover:bg-vibe-green/90 text-white" 
              : "bg-gradient-to-r from-vibe-purple to-vibe-purple/80 text-white hover:opacity-90"
          }`}
          size="sm"
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
