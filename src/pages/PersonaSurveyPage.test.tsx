import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { surveyTwo } from '../domain/surveys'
import { SurveyPage } from './SurveyPage'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  submitSurvey: vi.fn().mockResolvedValue(undefined),
}))

describe('persona survey page', () => {
  it('reuses the survey design with Spanish categories and seven-point Likert', () => {
    render(<SurveyPage survey={surveyTwo} />)

    expect(screen.getByText('Categoría 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos demográficos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2 Comportamiento' })).toBeInTheDocument()
    expect(screen.queryByText(/ID de participante/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('¿Cuál es tu edad?')).toBeInTheDocument()
    expect(screen.getByLabelText('Provincia')).toBeInTheDocument()
    expect(screen.getByLabelText('Cantón')).toBeDisabled()
    expect(screen.getByLabelText('Distrito')).toBeDisabled()
  })
})
