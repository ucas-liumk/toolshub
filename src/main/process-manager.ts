import { spawn, ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import { resolve, extname } from 'path'
import treeKill from 'tree-kill'

export type ToolStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

interface ManagedProcess {
  process: ChildProcess
  status: ToolStatus
}

class ProcessManager {
  private processes: Map<string, ManagedProcess> = new Map()

  private sendToRenderer(channel: string, ...args: unknown[]): void {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, ...args)
      }
    }
  }

  private setStatus(toolId: string, status: ToolStatus): void {
    const managed = this.processes.get(toolId)
    if (managed) {
      managed.status = status
    }
    this.sendToRenderer('process:status-changed', toolId, status)
  }

  private sendOutput(toolId: string, data: string): void {
    this.sendToRenderer('process:output', toolId, data)
  }

  launch(toolId: string, command: string, cwd: string): boolean {
    if (this.processes.has(toolId)) {
      const existing = this.processes.get(toolId)!
      if (existing.status === 'running' || existing.status === 'starting') {
        return false
      }
    }

    // Validate working directory
    if (!existsSync(cwd)) {
      this.sendOutput(toolId, `[启动失败] 工作目录不存在: ${cwd}\n`)
      this.sendToRenderer('process:status-changed', toolId, 'error')
      return false
    }

    // Pre-check: if command references a file, verify it exists
    const cmdParts = command.trim().split(/\s+/)
    const cmdFile = cmdParts[0]
    if (cmdFile && !cmdFile.includes('/') && !cmdFile.includes('\\')) {
      // Simple command name, no path - let shell resolve it
    } else {
      const absPath = resolve(cwd, cmdFile)
      if (!existsSync(absPath)) {
        this.sendOutput(toolId, `[启动失败] 命令文件不存在: ${absPath}\n`)
        this.sendToRenderer('process:status-changed', toolId, 'error')
        return false
      }
    }

    this.sendToRenderer('process:status-changed', toolId, 'starting')
    this.sendOutput(toolId, `[启动] 工作目录: ${cwd}\n[启动] 命令: ${command}\n`)

    try {
      // For .bat files, read content and execute the actual command
      // to avoid issues with 'pause' and missing paths
      let actualCommand = command
      const firstToken = command.trim().split(/\s+/)[0]
      if (extname(firstToken).toLowerCase() === '.bat') {
        const batPath = resolve(cwd, firstToken)
        if (existsSync(batPath)) {
          const fs = require('fs')
          const batContent: string = fs.readFileSync(batPath, 'utf-8')
          const lines = batContent.split(/\r?\n/).filter(
            (line: string) => line.trim() && !line.trim().toLowerCase().startsWith('pause') && !line.trim().startsWith('@echo off') && !line.trim().startsWith('REM') && !line.trim().startsWith('rem')
          )
          if (lines.length > 0) {
            actualCommand = lines.join(' && ')
            this.sendOutput(toolId, `[启动] 从 ${firstToken} 解析命令: ${actualCommand}\n`)
          }
        }
      }

      const child = spawn(actualCommand, [], {
        cwd,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: false
      })

      this.processes.set(toolId, { process: child, status: 'starting' })

      // small delay to confirm process started
      setTimeout(() => {
        const managed = this.processes.get(toolId)
        if (managed && managed.status === 'starting') {
          this.setStatus(toolId, 'running')
        }
      }, 500)

      child.stdout?.on('data', (data: Buffer) => {
        this.sendOutput(toolId, data.toString('utf-8'))
      })

      child.stderr?.on('data', (data: Buffer) => {
        this.sendOutput(toolId, data.toString('utf-8'))
      })

      child.on('error', (err) => {
        this.sendOutput(toolId, `[错误] ${err.message}\n`)
        this.setStatus(toolId, 'error')
      })

      child.on('exit', (code) => {
        const managed = this.processes.get(toolId)
        if (managed && managed.status !== 'stopping') {
          if (code !== 0 && code !== null) {
            this.sendOutput(toolId, `[进程退出] 退出码: ${code}\n`)
            this.setStatus(toolId, 'error')
          } else {
            this.sendOutput(toolId, `[进程退出] 退出码: ${code ?? 0}\n`)
            this.setStatus(toolId, 'stopped')
          }
        } else {
          this.sendOutput(toolId, `[进程已停止]\n`)
          this.setStatus(toolId, 'stopped')
        }
        this.processes.delete(toolId)
      })

      return true
    } catch (err) {
      this.sendOutput(toolId, `[启动失败] ${(err as Error).message}\n`)
      this.setStatus(toolId, 'error')
      return false
    }
  }

  stop(toolId: string): boolean {
    const managed = this.processes.get(toolId)
    if (!managed || !managed.process.pid) return false

    this.setStatus(toolId, 'stopping')

    return new Promise<boolean>((resolve) => {
      treeKill(managed.process.pid!, 'SIGTERM', (err) => {
        if (err) {
          console.error(`Failed to kill process tree for ${toolId}:`, err)
          // Try force kill
          treeKill(managed.process.pid!, 'SIGKILL', () => {
            resolve(true)
          })
        } else {
          resolve(true)
        }
      })
    }) as unknown as boolean
  }

  getStatus(toolId: string): ToolStatus {
    return this.processes.get(toolId)?.status ?? 'stopped'
  }

  getAllStatuses(): Record<string, ToolStatus> {
    const statuses: Record<string, ToolStatus> = {}
    for (const [id, managed] of this.processes) {
      statuses[id] = managed.status
    }
    return statuses
  }

  hasRunningProcesses(): boolean {
    for (const managed of this.processes.values()) {
      if (managed.status === 'running' || managed.status === 'starting') {
        return true
      }
    }
    return false
  }

  killAll(): void {
    for (const [toolId, managed] of this.processes) {
      if (managed.process.pid) {
        treeKill(managed.process.pid, 'SIGKILL', () => {
          console.log(`Killed process for ${toolId}`)
        })
      }
    }
    this.processes.clear()
  }
}

export const processManager = new ProcessManager()
