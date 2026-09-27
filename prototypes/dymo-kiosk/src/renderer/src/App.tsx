import { useState } from 'react'

type SampleStudent = {
  id: string
  name: string
  grade: string
  pickupCode: string
}

type LocalPrinter = {
  name: string
  displayName: string
}

const students: SampleStudent[] = [
  { id: 'student-1', name: 'TEST STUDENT', grade: 'Grade 7', pickupCode: 'ABC123' },
  { id: 'student-2', name: 'SAMPLE CHILD', grade: 'Grade 3', pickupCode: 'XYZ789' }
]

const buttonStyle = {
  padding: '14px 20px',
  fontSize: '18px',
  cursor: 'pointer',
  borderRadius: '8px',
  border: '1px solid #777'
}

function App(): React.JSX.Element {
  const [selectedId, setSelectedId] = useState(students[0].id)
  const [message, setMessage] = useState('')
  const [printers, setPrinters] = useState<LocalPrinter[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [printerMessage, setPrinterMessage] = useState('Printer list has not been loaded.')

  const student = students.find((person) => person.id === selectedId) ?? students[0]

  async function refreshPrinters(): Promise<void> {
    setPrinterMessage('Looking for printers...')

    try {
      const available = await window.api.listPrinters()
      setPrinters(available)

      // Keep the selection only if that printer is still installed.
      setSelectedPrinter((current) =>
        available.some((printer) => printer.name === current) ? current : ''
      )

      setPrinterMessage(
        available.length === 0
          ? 'Windows did not report any printers to Electron.'
          : `Windows reported ${available.length} printer(s).`
      )
    } catch (error) {
      setPrinters([])
      setSelectedPrinter('')
      setPrinterMessage(
        error instanceof Error
          ? `Could not list printers: ${error.message}`
          : 'Could not list printers: unknown error'
      )
    }
  }

  async function simulatePrint(): Promise<void> {
    setMessage('Preparing simulated label...')

    try {
      const result = await window.api.simulateStudentLabel(student.id)
      setMessage(result)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Simulation failed: ${error.message}`
          : 'Simulation failed: unknown error'
      )
    }
  }

  async function printPhysicalTestLabel(): Promise<void> {
  if (!selectedPrinter) {
    setMessage('Select a printer before printing a physical test label.')
    return
  }

  setMessage(`Submitting one test label to ${selectedPrinter}...`)

  try {
    const result = await window.api.printTestLabel(selectedPrinter)
    setMessage(result)
  } catch (error) {
    setMessage(
      error instanceof Error
        ? `Physical print failed: ${error.message}`
        : 'Physical print failed: unknown error'
    )
  }
}

  return (
    <main
      style={{
        maxWidth: '700px',
        width: '100%',
        margin: '40px auto',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <h1>Church Check-In: Label Test</h1>
      <p>Phase 0 test. All names and codes on this screen are sample data.</p>

      <h2>Local printer discovery</h2>
      <button type="button" onClick={refreshPrinters} style={buttonStyle}>
        Refresh printers
      </button>
      <p role="status">{printerMessage}</p>

      <label htmlFor="printer" style={{ display: 'block', marginBottom: '8px' }}>
        Printer on this computer
      </label>
      <select
        id="printer"
        value={selectedPrinter}
        onChange={(event) => setSelectedPrinter(event.target.value)}
        style={{ ...buttonStyle, width: '100%' }}
      >
        <option value="">Select a printer</option>
        {printers.map((printer) => (
          <option key={printer.name} value={printer.name}>
            {printer.displayName || printer.name}
          </option>
        ))}
      </select>
      <p>
        {selectedPrinter
          ? `Selected: ${selectedPrinter}. Selection only; no printer job will be sent.`
          : 'No printer selected. The simulated label works without a printer.'}
      </p>

      <hr style={{ margin: '28px 0' }} />

      <label htmlFor="student" style={{ display: 'block', marginBottom: '8px' }}>
        Select a sample student
      </label>
      <select
        id="student"
        value={selectedId}
        onChange={(event) => {
          setSelectedId(event.target.value)
          setMessage('')
        }}
        style={{ ...buttonStyle, width: '100%' }}
      >
        {students.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>

      <h2>Student label preview</h2>
      <section
        aria-label="Student label preview"
        style={{
          background: 'white',
          color: 'black',
          border: '2px solid black',
          borderRadius: '6px',
          padding: '24px',
          marginBottom: '24px',
          width: '320px',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{student.name}</div>
        <div style={{ fontSize: '19px', marginTop: '12px' }}>{student.grade}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '12px' }}>
          {student.pickupCode}
        </div>
      </section>

      <button type="button" onClick={simulatePrint} style={buttonStyle}>
        Simulate printing student label
      </button>
      <button
        type="button"
        onClick={printPhysicalTestLabel}
        style={{ ...buttonStyle, marginLeft: '12px' }}
      >
        Print one physical test label
      </button>
      {message && <p role="status">{message}</p>}
    </main>
  )
}

export default App
