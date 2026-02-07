import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div className="h-10 shrink-0 drag-region" />
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
