import type { SurveyAnswers } from '../domain/types'

const DRAFT_KEY = 'encuesta-programacion-draft-v1'

export function loadDraft(): SurveyAnswers {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as SurveyAnswers
  } catch {
    return {}
  }
}

export function saveDraft(answers: SurveyAnswers) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}
