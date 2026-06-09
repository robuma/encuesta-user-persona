import { questions } from './questions'
import { costaRicaDateKey } from './dates'
import { answerValue } from './survey'
import type { QuestionId, ResultFilters, SurveyResponse } from './types'

export function filterResponses(responses: SurveyResponse[], filters: ResultFilters): SurveyResponse[] {
  return responses.filter((response) => {
    const date = costaRicaDateKey(response.submitted_at)
    if (filters.from && date < filters.from) return false
    if (filters.to && date > filters.to) return false
    if (filters.questionId && filters.value && String(answerValue(response.answers[filters.questionId])) !== filters.value) return false
    return true
  })
}

export function likertDistribution(responses: SurveyResponse[], questionId: QuestionId) {
  return [1, 2, 3, 4, 5].map((value) => ({
    value,
    count: responses.filter((response) => Number(answerValue(response.answers[questionId])) === value).length,
  }))
}

export function optionDistribution(responses: SurveyResponse[], questionId: QuestionId, options: string[]) {
  return options.map((option) => ({
    option,
    count: responses.filter((response) => String(answerValue(response.answers[questionId])) === option).length,
  }))
}

const csvCell = (value: unknown) => {
  const normalized = typeof value === 'object' && value !== null ? `${(value as { value: string }).value}${(value as { detail?: string }).detail ? `: ${(value as { detail?: string }).detail}` : ''}` : value ?? ''
  return `"${String(normalized).replaceAll('"', '""')}"`
}

export function responsesToCsv(responses: SurveyResponse[]): string {
  const headers = ['id', 'submitted_at', ...questions.map((question) => question.id)]
  const rows = responses.map((response) => [
    response.id,
    response.submitted_at,
    ...questions.map((question) => response.answers[question.id]),
  ].map(csvCell).join(','))
  return [headers.map(csvCell).join(','), ...rows].join('\n')
}
