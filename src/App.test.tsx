import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./pages/ResultsPage', () => ({
  ResultsPage: () => <main>Resultados</main>,
}))

afterEach(() => {
  cleanup()
  location.hash = ''
})

describe('document titles', () => {
  it('uses Encuesta for the survey route', async () => {
    location.hash = '#/'
    render(<App />)
    await waitFor(() => expect(document.title).toBe('Encuesta'))
  })

  it('uses Resultados Encuesta for the results route', async () => {
    location.hash = '#/resultados'
    render(<App />)
    await waitFor(() => expect(document.title).toBe('Resultados Encuesta'))
  })
})
