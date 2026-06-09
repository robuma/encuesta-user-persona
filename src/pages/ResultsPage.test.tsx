import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResultsPage } from './ResultsPage'

vi.mock('../lib/supabase', () => ({
  fetchResponses: vi.fn().mockResolvedValue([]),
}))

describe('results page header', () => {
  it('shows the results panel description', async () => {
    render(<ResultsPage />)

    expect(await screen.findByText('Panel de resultados')).toBeInTheDocument()
    expect(screen.getByText('Vista de gráficos y resultados por pregunta')).toBeInTheDocument()
  })
})
