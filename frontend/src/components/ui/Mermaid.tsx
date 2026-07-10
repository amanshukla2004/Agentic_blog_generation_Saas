import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    if (ref.current && chart) {
      // Sanitize common LLM unicode hallucinations
      const sanitizedChart = chart
        .replace(/⟶/g, '-->')
        .replace(/▷/g, '|')
        .replace(/—>/g, '-->')
        .replace(/➔/g, '-->')
        .replace(/\|>/g, '|');
      
      const renderChart = async () => {
        try {
          // Parse first to avoid Mermaid throwing fatal errors on bad syntax
          await mermaid.parse(sanitizedChart);
          const { svg } = await mermaid.render(id, sanitizedChart);
          if (isMounted && ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (e: any) {
          console.error('Mermaid render error', e);
          if (isMounted && ref.current) {
            ref.current.innerHTML = `<div class="text-danger text-xs border border-danger p-4 font-mono whitespace-pre-wrap">Invalid Mermaid Chart Syntax:\n${e?.message || 'Error'}</div>`;
          }
        } finally {
          const errorNode = document.getElementById(`d${id}`);
          if (errorNode) errorNode.remove();
          document.querySelectorAll('body > svg[id^="dmermaid-"]').forEach(el => el.remove());
        }
      };
      
      renderChart();
    }
    
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return <div ref={ref} className="flex justify-center my-4 overflow-x-auto" />;
};
