"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth="max-w-md"
    >
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? "destructive" : "default"}
          size="sm"
          isLoading={isLoading}
          onClick={() => {
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
