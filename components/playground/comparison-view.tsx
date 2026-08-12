"use client";

import * as React from "react";
import { OutputPanel } from "./output-panel";
import { ModelConfig } from "./model-config";

export function ComparisonView() {
  return (
    <div className="flex flex-col h-full gap-3">
      {/* Model Configuration Strip for both models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ModelConfig pane="A" label="Model A Configuration" />
        <ModelConfig pane="B" label="Model B Configuration" />
      </div>

      {/* Output Streams Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-87.5">
        <OutputPanel pane="A" title="Model A Stream" />
        <OutputPanel pane="B" title="Model B Stream" />
      </div>
    </div>
  );
}
