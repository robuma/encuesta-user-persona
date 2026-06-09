import type { Answer, SurveyQuestion } from '../domain/types'

export function QuestionCard({ question, answer, invalid, onChange }: { question: SurveyQuestion; answer?: Answer; invalid: boolean; onChange: (answer: Answer) => void }) {
  const selected = typeof answer === 'object' ? answer.value : String(answer ?? '')
  const detail = typeof answer === 'object' ? answer.detail ?? '' : ''
  const setSelected = (value: string) => onChange(question.type === 'conditional' ? { value, detail: question.detailWhen?.includes(value) ? detail : '' } : question.type === 'likert' ? Number(value) : value)
  const needsDetail = question.detailWhen?.includes(selected)

  return (
    <fieldset id={question.id} className={`question-card ${invalid ? 'invalid' : ''}`}>
      <legend><span>{question.number}</span>{question.text}</legend>
      {question.type === 'open' ? (
        <textarea value={selected} onChange={(event) => onChange(event.target.value)} rows={5} placeholder="Escribí tu respuesta..." />
      ) : question.type === 'likert' ? (
        <>
          <div className="likert-labels"><span>Totalmente en desacuerdo</span><span>Totalmente de acuerdo</span></div>
          <div className="likert-options">
            {question.options?.map((option) => <label key={option} className={selected === option ? 'selected' : ''}><input type="radio" name={question.id} value={option} checked={selected === option} onChange={() => setSelected(option)} /><strong>{option}</strong></label>)}
          </div>
        </>
      ) : (
        <div className="radio-options">
          {question.options?.map((option) => <label key={option} className={selected === option ? 'selected' : ''}><input type="radio" name={question.id} value={option} checked={selected === option} onChange={() => setSelected(option)} /><span>{option}</span></label>)}
        </div>
      )}
      {needsDetail && <input className="detail-input" value={detail} onChange={(event) => onChange({ value: selected, detail: event.target.value })} placeholder={question.detailLabel} />}
      {invalid && <p className="field-error">Respondé esta pregunta antes de continuar.</p>}
    </fieldset>
  )
}
