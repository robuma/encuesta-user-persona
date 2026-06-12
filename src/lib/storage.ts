import type { SurveyAnswers } from '../domain/types'

export function loadDraft(key = 'encuesta-programacion-draft-v1'): SurveyAnswers {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as SurveyAnswers
  } catch {
    return {}
  }
}

export function saveDraft(answers: SurveyAnswers, key = 'encuesta-programacion-draft-v1') {
  localStorage.setItem(key, JSON.stringify(answers))
}

export function clearDraft(key = 'encuesta-programacion-draft-v1') {
  localStorage.removeItem(key)
}
