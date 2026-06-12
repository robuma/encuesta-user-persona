import { useState } from 'react'
import { costaRicaLocations } from '../domain/costaRicaLocations'
import type { Answer, SurveyQuestion } from '../domain/types'

function LocationSelect({ answer, onChange }: { answer?: Answer; onChange: (answer: Answer) => void }) {
  const initial = typeof answer === 'string' ? answer.split(' > ') : []
  const [province, setProvince] = useState(initial[0] ?? '')
  const [canton, setCanton] = useState(initial[1] ?? '')
  const [district, setDistrict] = useState(initial[2] ?? '')
  const cantons = province ? Object.keys(costaRicaLocations[province] ?? {}) : []
  const districts = province && canton ? costaRicaLocations[province]?.[canton] ?? [] : []

  return (
    <div className="location-selects">
      <label>Provincia<select value={province} onChange={(event) => { setProvince(event.target.value); setCanton(''); setDistrict(''); onChange('') }}><option value="">Seleccioná una provincia</option>{Object.keys(costaRicaLocations).map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Cantón<select disabled={!province} value={canton} onChange={(event) => { setCanton(event.target.value); setDistrict(''); onChange('') }}><option value="">Seleccioná un cantón</option>{cantons.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Distrito<select disabled={!canton} value={district} onChange={(event) => { const nextDistrict = event.target.value; setDistrict(nextDistrict); onChange(nextDistrict ? `${province} > ${canton} > ${nextDistrict}` : '') }}><option value="">Seleccioná un distrito</option>{districts.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
  )
}

export function QuestionCard({ question, answer, invalid, onChange }: { question: SurveyQuestion; answer?: Answer; invalid: boolean; onChange: (answer: Answer) => void }) {
  const selected = typeof answer === 'object' && answer !== null && !Array.isArray(answer) ? answer.value : String(answer ?? '')
  const selectedMany = Array.isArray(answer) ? answer : []
  const detail = typeof answer === 'object' && answer !== null && !Array.isArray(answer) ? answer.detail ?? '' : ''
  const setSelected = (value: string) => onChange(question.type === 'conditional' ? { value, detail: question.detailWhen?.includes(value) ? detail : '' } : question.type === 'likert' ? Number(value) : value)
  const needsDetail = question.detailWhen?.includes(selected)

  return (
    <fieldset id={question.id} className={`question-card ${invalid ? 'invalid' : ''}`}>
      <legend><span>{question.label ?? question.number}</span>{question.text}</legend>
      {question.type === 'open' ? (
        <textarea value={selected} onChange={(event) => onChange(event.target.value)} rows={5} placeholder="Escribí tu respuesta..." />
      ) : question.type === 'short' ? (
        <input className="short-input" value={selected} onChange={(event) => onChange(event.target.value)} placeholder="Escribí tu respuesta..." />
      ) : question.type === 'select' ? (
        <select aria-label={question.text} value={selected} onChange={(event) => onChange(event.target.value)}><option value="">Seleccioná una opción</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select>
      ) : question.type === 'location' ? (
        <LocationSelect answer={answer} onChange={onChange} />
      ) : question.type === 'likert' ? (
        <>
          <div className="likert-labels"><span>Totalmente en desacuerdo</span><span>Totalmente de acuerdo</span></div>
          <div className="likert-options" style={{ gridTemplateColumns: `repeat(${question.options?.length ?? 5}, 1fr)` }}>
            {question.options?.map((option) => <label key={option} className={selected === option ? 'selected' : ''}><input type="radio" name={question.id} value={option} checked={selected === option} onChange={() => setSelected(option)} /><strong>{option}</strong></label>)}
          </div>
        </>
      ) : question.type === 'multi' ? (
        <div className="radio-options">
          {question.options?.map((option) => <label key={option} className={selectedMany.includes(option) ? 'selected' : ''}><input type="checkbox" name={question.id} value={option} checked={selectedMany.includes(option)} onChange={() => onChange(selectedMany.includes(option) ? selectedMany.filter((item) => item !== option) : [...selectedMany, option])} /><span>{option}</span></label>)}
        </div>
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
