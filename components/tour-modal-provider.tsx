"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { TourForm } from "@/components/tour-form";
import { centre } from "@/lib/content";

const TourModalContext = createContext<{ open: () => void }>({ open: () => {} });

/** Lets the header CTA and the hero button share one dialog instance. */
export const useTourModal = () => useContext(TourModalContext);

export function TourModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <TourModalContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={close}
        title="Come and see us"
        description={`Visits run ${centre.hours.days}, ${centre.hours.open} to ${centre.hours.close}. Tell us when suits and we'll show you around.`}
      >
        <TourForm />
      </Modal>
    </TourModalContext.Provider>
  );
}
