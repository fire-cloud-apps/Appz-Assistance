import { db } from '../database/appDatabase'
import { notesDb } from '../../modules/notes/data/datasources/notesDatabase'

export type ExportModule = 'tasks' | 'notes'

export interface ExportData {
  module: ExportModule
  exportedAt: string
  version: number
  data: unknown
}

export interface TaskExportData {
  tasks: unknown[]
  taskActivities: unknown[]
}

export interface NoteExportData {
  notes: unknown[]
  folders: unknown[]
}

export async function exportModuleData(module: ExportModule): Promise<ExportData> {
  const exportedAt = new Date().toISOString()
  
  switch (module) {
    case 'tasks': {
      const tasks = await db.tasks.toArray()
      const activities = await db.taskActivities.toArray()
      return {
        module,
        exportedAt,
        version: 1,
        data: { tasks, taskActivities: activities } as TaskExportData,
      }
    }
    case 'notes': {
      const notes = await notesDb.notes.toArray()
      const folders = await notesDb.folders.toArray()
      return {
        module,
        exportedAt,
        version: 1,
        data: { notes, folders } as NoteExportData,
      }
    }
    default:
      throw new Error(`Unknown module: ${module}`)
  }
}

export function downloadExportData(data: ExportData): void {
  const filename = `${data.module}_export_${new Date().toISOString().split('T')[0]}.json`
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importModuleData(file: File): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as ExportData
    
    if (!data.module || !data.data || !data.exportedAt) {
      return { success: false, message: 'Invalid file format. Missing required fields.' }
    }

    switch (data.module) {
      case 'tasks':
        return importTasks(data.data as TaskExportData)
      case 'notes':
        return importNotes(data.data as NoteExportData)
      default:
        return { success: false, message: `Unknown module: ${data.module}` }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, message: 'Invalid JSON file.' }
    }
    return { success: false, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

async function importTasks(data: TaskExportData): Promise<{ success: boolean; message: string; count?: number }> {
  if (!Array.isArray(data.tasks)) {
    return { success: false, message: 'Invalid tasks data format.' }
  }

  let importedCount = 0
  
  await db.transaction('rw', db.tasks, db.taskActivities, async () => {
    for (const task of data.tasks) {
      try {
        const existingTask = await db.tasks.get((task as { id: string }).id)
        if (!existingTask) {
          await db.tasks.add(task as never)
          importedCount++
        }
      } catch (e) {
        console.warn('Failed to import task:', e)
      }
    }

    if (Array.isArray(data.taskActivities)) {
      for (const activity of data.taskActivities) {
        try {
          const existingActivity = await db.taskActivities.get((activity as { id: string }).id)
          if (!existingActivity) {
            await db.taskActivities.add(activity as never)
          }
        } catch (e) {
          console.warn('Failed to import task activity:', e)
        }
      }
    }
  })

  return { success: true, message: `Successfully imported ${importedCount} tasks.`, count: importedCount }
}

async function importNotes(data: NoteExportData): Promise<{ success: boolean; message: string; count?: number }> {
  if (!Array.isArray(data.notes) || !Array.isArray(data.folders)) {
    return { success: false, message: 'Invalid notes data format.' }
  }

  let importedCount = 0
  
  await notesDb.transaction('rw', notesDb.notes, notesDb.folders, async () => {
    for (const folder of data.folders) {
      try {
        const existingFolder = await notesDb.folders.get((folder as { id: string }).id)
        if (!existingFolder) {
          await notesDb.folders.add(folder as never)
        }
      } catch (e) {
        console.warn('Failed to import folder:', e)
      }
    }

    for (const note of data.notes) {
      try {
        const existingNote = await notesDb.notes.get((note as { id: string }).id)
        if (!existingNote) {
          await notesDb.notes.add(note as never)
          importedCount++
        }
      } catch (e) {
        console.warn('Failed to import note:', e)
      }
    }
  })

  return { success: true, message: `Successfully imported ${importedCount} notes.`, count: importedCount }
}
