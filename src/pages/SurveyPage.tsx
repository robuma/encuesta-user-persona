import { useEffect, useMemo, useState } from 'react'
import { ProgressHeader } from '../components/ProgressHeader'
import { QuestionCard } from '../components/QuestionCard'
import { completionPercent, validateStep, validateSurvey } from '../domain/survey'
import { surveyOne } from '../domain/surveys'
import type { Answer, SurveyAnswers, SurveyDefinition } from '../domain/types'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage'
import { isSupabaseConfigured, submitSurvey } from '../lib/supabase'

export function SurveyPage({ survey = surveyOne }: { survey?: SurveyDefinition }) {
  const { questions, sectionTitles } = survey
  const [answers, setAnswers] = useState<SurveyAnswers>(() => loadDraft(survey.draftKey))
  const [step, setStep] = useState(0)
  const [invalid, setInvalid] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const stepQuestions = useMemo(() => questions.filter((question) => question.step === step), [step])
  const sections = [...new Set(stepQuestions.map((question) => question.section))]
  const percent = completionPercent(questions, answers)

  useEffect(() => saveDraft(answers, survey.draftKey), [answers, survey.draftKey])
  const changeAnswer = (id: string, answer: Answer) => {
    setAnswers((current) => ({ ...current, [id]: answer }))
    setInvalid((current) => current.filter((item) => item !== id))
  }
  const goTo = (next: number) => {
    if (next > step) {
      const missing = validateStep(questions, step, answers)
      if (missing.length) {
        setInvalid(missing)
        document.getElementById(missing[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    setInvalid([])
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const send = async () => {
    const missing = validateSurvey(questions, answers)
    if (missing.length) {
      setInvalid(missing)
      const first = questions.find((question) => question.id === missing[0])
      if (first) setStep(first.step)
      return
    }
    setStatus('sending')
    setError('')
    try {
      await submitSurvey(answers, survey.version)
      clearDraft(survey.draftKey)
      setStatus('sent')
      window.scrollTo({ top: 0 })
    } catch {
      setError('No pudimos enviar tus respuestas. Revisá tu conexión e intentá de nuevo.')
      setStatus('idle')
    }
  }

  if (status === 'sent') return <main className="success-page"><div className="success-mark">✓</div><p className="eyebrow">Envío completado</p><h1>Gracias por compartir tu experiencia</h1><p>Tus respuestas anónimas fueron registradas correctamente y se utilizarán únicamente con fines académicos.</p></main>

  return (
    <div className="survey-shell">
      <section className="hero">
        <p className="eyebrow">Investigación académica · Encuesta anónima</p>
        <h1>Encuesta para estudiantes de primer ingreso en cursos introductorios de programación</h1>
        <p>Esta encuesta forma parte de un trabajo de investigación sobre la experiencia de estudiantes de primer ingreso en cursos introductorios de programación. Las respuestas son anónimas y se utilizarán únicamente con fines académicos.</p>
        <div className="privacy-note">Por favor, responde con sinceridad según tu situación actual. No hay respuestas “buenas” o “malas”.</div>
      </section>
      <ProgressHeader step={step} percent={percent} labels={survey.stepLabels} onStep={goTo} />
      <main className="survey-content">
        {sections.map((section) => <section key={section} className="survey-section"><div className="section-heading"><span>{survey.sectionLabel} {section + 1}</span><h2>{sectionTitles[section]}</h2>{stepQuestions.some((question) => question.section === section && question.type === 'likert') && <p>{survey.likertDescription}</p>}</div>{stepQuestions.filter((question) => question.section === section).map((question) => <QuestionCard key={question.id} question={question} answer={answers[question.id]} invalid={invalid.includes(question.id)} onChange={(answer) => changeAnswer(question.id, answer)} />)}</section>)}
        {!isSupabaseConfigured && <p className="config-warning">Modo de demostración: configurá las variables de Supabase para habilitar el envío.</p>}
        {error && <p className="submit-error" role="alert">{error}</p>}
        <div className="survey-actions">{step > 0 && <button className="secondary" onClick={() => goTo(step - 1)}>Anterior</button>}<span />{step < survey.stepLabels.length - 1 ? <button onClick={() => goTo(step + 1)}>Continuar</button> : <button disabled={status === 'sending' || !isSupabaseConfigured} onClick={send}>{status === 'sending' ? 'Enviando…' : 'Enviar respuestas'}</button>}</div>
      </main>
      <footer>Curso PF-3855 | Desarrollo de Software Centrado en el Humano</footer>
    </div>
  )
}
