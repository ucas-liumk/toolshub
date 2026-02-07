import { useEffect, useRef } from 'react'

interface ConsoleOutputProps {
  output: string[]
}

export function ConsoleOutput({ output }: ConsoleOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [output])

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 rounded-lg p-3 h-48 overflow-auto font-mono text-xs leading-5"
    >
      {output.length === 0 ? (
        <span className="text-slate-500">等待输出...</span>
      ) : (
        output.map((line, i) => (
          <div key={i} className="text-slate-300 whitespace-pre-wrap break-all">
            {line}
          </div>
        ))
      )}
    </div>
  )
}
