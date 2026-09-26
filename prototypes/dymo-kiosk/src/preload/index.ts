import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  simulateStudentLabel: (studentId: string): Promise<string> =>
    ipcRenderer.invoke('label:simulate-student', studentId),
  listPrinters: (): Promise<{ name: string; displayName: string }[]> =>
    ipcRenderer.invoke('printers:list')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (defined by the starter's renderer types)
  window.electron = electronAPI
  // @ts-ignore (defined by the starter's renderer types)
  window.api = api
}