"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, RotateCcw } from "lucide-react";

export default function CounterExperiment() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Counter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-6xl font-bold tabular-nums">{count}</div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount((c) => c - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(0)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount((c) => c + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground max-w-md text-center">
        This experiment demonstrates basic React state management using the{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded">useState</code> hook.
        Click the buttons to increment, decrement, or reset the counter.
      </div>
    </div>
  );
}
