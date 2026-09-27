/// <reference types="vite/client" />

interface Window {
  api: {
    simulateStudentLabel: (studentId: string) => Promise<string>
    listPrinters: () => Promise<{ name: string; displayName: string }[]>
    printTestLabel: (printerName: string) => Promise<string>
  }
}