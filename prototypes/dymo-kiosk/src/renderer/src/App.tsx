import { useState } from 'react'

type SampleStudent = {
  id: string
  name: string
  grade: string
  pickupCode: string
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

  const student = students.find((person) => person.id === selectedId) ?? students[0]

  function simulatePrint(): void {
    setMessage(`Simulation complete: prepared a student label for ${student.name}. No printer was used.`)
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
      <p>Phase 0 home test. All names and codes on this screen are sample data.</p>

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

      {message && <p role="status">{message}</p>}
    </main>
  )
}

export default App
