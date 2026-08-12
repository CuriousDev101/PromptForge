"use client";

import * as React from "react";
import { Topbar } from "./topbar";
import { ExportDialog } from "@/components/playground/export-dialog";
import { VersionHistoryDrawer } from "@/components/playground/version-history-drawer";
import { RenderedPromptPreview } from "@/components/playground/rendered-prompt-preview";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [versionsOpen, setVersionsOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Topbar
        onOpenExport={() => setExportOpen(true)}
        onOpenVersions={() => setVersionsOpen(true)}
      />

      <main className="flex-1 flex flex-col">{children}</main>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <VersionHistoryDrawer open={versionsOpen} onOpenChange={setVersionsOpen} />
      <RenderedPromptPreview open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
