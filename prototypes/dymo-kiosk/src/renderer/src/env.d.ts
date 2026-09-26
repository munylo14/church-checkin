/// <reference types="vite/client" />

interface Window {
  api: {
    simulateStudentLabel: (studentId: string) => Promise<string>
  }
}