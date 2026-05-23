"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Só renderiza no lado do cliente após encontrar o elemento "portal-root"
  return mounted 
    ? createPortal(children, document.getElementById('portal-root')) 
    : null;
}