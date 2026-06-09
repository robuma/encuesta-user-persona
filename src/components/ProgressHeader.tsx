const labels = ['Contexto', 'Experiencia y motivación', 'Aprendizaje', 'Apoyo y reflexión']

export function ProgressHeader({ step, percent, onStep }: { step: number; percent: number; onStep: (step: number) => void }) {
  return (
    <header className="progress-header">
      <div className="progress-copy"><strong>{percent}% completado</strong></div>
      <div className="progress-track" aria-label={`${percent}% completado`}><span style={{ width: `${percent}%` }} /></div>
      <nav className="step-tabs" aria-label="Secciones de la encuesta">
        {labels.map((label, index) => <button type="button" className={index === step ? 'active' : ''} onClick={() => onStep(index)} key={label}><span>{index + 1}</span>{label}</button>)}
      </nav>
    </header>
  )
}
