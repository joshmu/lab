"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, Check } from "lucide-react";

function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

export default function GradientGeneratorExperiment() {
  const [colors, setColors] = useState<[string, string]>([
    randomColor(),
    randomColor(),
  ]);
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradient = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;

  const regenerate = useCallback(() => {
    setColors([randomColor(), randomColor()]);
    setAngle(Math.floor(Math.random() * 360));
  }, []);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(`background: ${gradient};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [gradient]);

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Gradient Generator</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Preview */}
          <div
            className="h-48 rounded-lg shadow-inner"
            style={{ background: gradient }}
          />

          {/* Color inputs */}
          <div className="flex gap-4 justify-center">
            <div className="flex flex-col items-center gap-2">
              <input
                type="color"
                value={colors[0]}
                onChange={(e) => setColors([e.target.value, colors[1]])}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {colors[0]}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <input
                type="color"
                value={colors[1]}
                onChange={(e) => setColors([colors[0], e.target.value])}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {colors[1]}
              </span>
            </div>
          </div>

          {/* Angle slider */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground text-center">
              Angle: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* CSS output */}
          <div className="bg-muted rounded-lg p-3">
            <code className="text-xs break-all">background: {gradient};</code>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={regenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Randomize
            </Button>
            <Button onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSS
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground max-w-md text-center">
        Generate beautiful CSS gradients by picking colors or clicking randomize.
        Copy the CSS code to use in your projects.
      </div>
    </div>
  );
}
