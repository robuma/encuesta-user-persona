import { beforeEach, describe, expect, it } from 'vitest'
import { clearDraft, loadDraft, saveDraft } from './storage'

describe('local survey draft', () => {
  beforeEach(() => localStorage.clear())

  it('restores saved answers', () => {
    saveDraft({ q01: 'Sí', q13: 4 })
    expect(loadDraft()).toEqual({ q01: 'Sí', q13: 4 })
  })

  it('clears the draft after submission', () => {
    saveDraft({ q01: 'Sí' })
    clearDraft()
    expect(loadDraft()).toEqual({})
  })

  it('ignores a corrupted draft', () => {
    localStorage.setItem('encuesta-programacion-draft-v1', '{invalid')
    expect(loadDraft()).toEqual({})
  })
})
