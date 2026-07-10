import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.render(`mermaid-${Math.random().toString(36).substring(2, 9)}`, chart)
        .then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
          }
        })
        .catch((e) => {
          console.error('Mermaid render error', e);
        });
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center my-4 overflow-x-auto" />;
};
