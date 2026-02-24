"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type CursorType = "default" | "text" | "button" | "view";

interface CursorContextType {
  cursorType: CursorType;
  cursorText: string;
  setCursor: (type: CursorType, text?: string) => void;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorType, setCursorTypeState] = useState<CursorType>("default");
  const [cursorText, setCursorTextState] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const setCursor = (type: CursorType, text: string = "") => {
    setCursorTypeState(type);
    setCursorTextState(text);
  };

  return (
    <CursorContext.Provider value={{ cursorType, cursorText, setCursor, activeSection, setActiveSection }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
