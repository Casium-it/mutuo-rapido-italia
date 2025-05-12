
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
    <Card className={`shadow-lg border hover-grow ${
      variant === "primary" 
        ? "border-vibe-green border-opacity-30" 
        : "border-vibe-purple border-opacity-30"
    } w-full max-w-md`}>
      <CardHeader className={`${
        variant === "primary" 
          ? "bg-vibe-green/5" 
          : "bg-vibe-purple/5"
      } rounded-t-lg`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <Badge variant={variant === "primary" ? "default" : "outline"} className={
            variant === "primary" 
              ? "bg-vibe-green text-white hover:bg-vibe-green/80" 
              : "border-vibe-purple text-vibe-purple hover:bg-vibe-purple/10"
          }>
            {variant === "primary" ? "Veloce" : "Completo"}
          </Badge>
        </div>
        <CardDescription className="text-base pt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`rounded-full p-1 mt-0.5 ${
                variant === "primary" 
                  ? "text-vibe-green bg-vibe-green/10" 
                  : "text-vibe-purple bg-vibe-purple/10"
              }`}>
                <point.icon className="h-4 w-4" />
              </div>
              <span className="text-sm">{point.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button 
          className={`w-full font-medium ${
            variant === "primary" 
              ? "gradient-bg hover:opacity-90" 
              : "border-vibe-purple text-vibe-purple bg-transparent hover:bg-vibe-purple/10"
          }`}
          size="lg"
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
