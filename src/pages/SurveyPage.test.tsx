import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../domain/questions'
import { SurveyPage } from './SurveyPage'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  submitSurvey: vi.fn().mockResolvedValue(undefined),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('survey confirmation', () => {
  it('shows the research introduction from the questionnaire', () => {
    render(<SurveyPage />)

    expect(screen.getByRole('heading', { name: 'Encuesta para estudiantes de primer ingreso en cursos introductorios de programación' })).toBeInTheDocument()
    expect(screen.getByText(/Esta encuesta forma parte de un trabajo de investigación/)).toBeInTheDocument()
    expect(screen.getByText(/Por favor, responde con sinceridad/)).toBeInTheDocument()
    expect(screen.queryByText(/no solicitamos nombre/)).not.toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Investigación académica · Encuesta anónima')
  })

  it('shows a centered thank-you message without a second-response button', async () => {
    const answers = Object.fromEntries(questions.map((question) => [
      question.id,
      question.type === 'likert' ? 3 : question.type === 'conditional' ? { value: question.options?.find((option) => !question.detailWhen?.includes(option)) ?? 'No' } : 'Respuesta',
    ]))
    localStorage.setItem('encuesta-programacion-draft-v1', JSON.stringify(answers))
    render(<SurveyPage />)

    fireEvent.click(screen.getByRole('button', { name: '4 Apoyo y reflexión' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar respuestas' }))

    expect(await screen.findByRole('heading', { name: 'Gracias por compartir tu experiencia' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enviar otra respuesta' })).not.toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('success-page')
  })
})
