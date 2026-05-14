'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  csvRaw: string | null;
  setCsvRaw: (data: string | null) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [csvRaw, setCsvRaw] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const clearData = () => {
    setCsvRaw(null);
    setFileName(null);
  };

  return (
    <DataContext.Provider value={{ csvRaw, setCsvRaw, fileName, setFileName, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
