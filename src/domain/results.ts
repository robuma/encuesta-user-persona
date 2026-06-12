import { costaRicaDateKey } from './dates'
import { answerValue } from './survey'
import type { Answer, QuestionId, ResultFilters, SurveyQuestion, SurveyResponse } from './types'

const filterableTypes = new Set<SurveyQuestion['type']>(['single', 'multi', 'conditional', 'select', 'location'])

export function filterableQuestions(questions: SurveyQuestion[]): SurveyQuestion[] {
  return questions.filter((question) => filterableTypes.has(question.type))
}

export function filterResponses(responses: SurveyResponse[], filters: ResultFilters, questions: SurveyQuestion[] = []): SurveyResponse[] {
  return responses.filter((response) => {
    const date = costaRicaDateKey(response.submitted_at)
    if (filters.from && date < filters.from) return false
    if (filters.to && date > filters.to) return false
    const question = questions.find((item) => item.id === filters.questionId)
    const rawValue = filters.questionId ? answerValue(response.answers[filters.questionId]) : undefined
    const value = question && !Array.isArray(rawValue) ? resultAnswerValue(question, rawValue) : rawValue
    if (filters.questionId && filters.value && (Array.isArray(value) ? !value.includes(filters.value) : String(value) !== filters.value)) return false
    return true
  })
}

export function likertDistribution(responses: SurveyResponse[], questionId: QuestionId, points = 5) {
  return Array.from({ length: points }, (_, index) => index + 1).map((value) => ({
    value,
    count: responses.filter((response) => Number(answerValue(response.answers[questionId])) === value).length,
  }))
}

export function optionDistribution(responses: SurveyResponse[], questionId: QuestionId, options: string[]) {
  return options.map((option) => ({
    option,
    count: responses.filter((response) => {
      const value = answerValue(response.answers[questionId])
      return Array.isArray(value) ? value.includes(option) : String(value) === option
    }).length,
  }))
}

export function resultAnswerValue(question: SurveyQuestion, answer: unknown): string {
  const value = String(answerValue(answer as Answer | undefined) ?? '')
  if (question.resultValue === 'province') return value.split(' > ')[0] ?? value
  if (question.resultValue === 'district') return value.split(' > ').at(-1) ?? value
  return value
}

export function observedDistribution(responses: SurveyResponse[], question: SurveyQuestion) {
  const counts = new Map<string, number>()
  responses.forEach((response) => {
    const value = resultAnswerValue(question, response.answers[question.id])
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  })
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
    .map(([option, count]) => ({ option, count }))
}

export function observedAnswerOptions(responses: SurveyResponse[], question: SurveyQuestion): string[] {
  const options = new Set<string>()
  responses.forEach((response) => {
    const value = answerValue(response.answers[question.id])
    if (Array.isArray(value)) {
      value.forEach((item) => options.add(item))
    } else {
      const displayed = resultAnswerValue(question, value)
      if (displayed) options.add(displayed)
    }
  })
  return [...options].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

const csvCell = (value: unknown) => {
  const normalized = Array.isArray(value)
    ? value.join('; ')
    : typeof value === 'object' && value !== null
      ? `${(value as { value: string }).value}${(value as { detail?: string }).detail ? `: ${(value as { detail?: string }).detail}` : ''}`
      : value ?? ''
  return `"${String(normalized).replaceAll('"', '""')}"`
}

export function responsesToCsv(responses: SurveyResponse[], questions: SurveyQuestion[]): string {
  const headers = ['id', 'submitted_at', ...questions.map((question) => question.id)]
  const rows = responses.map((response) => [
    response.id,
    response.submitted_at,
    ...questions.map((question) => response.answers[question.id]),
  ].map(csvCell).join(','))
  return [headers.map(csvCell).join(','), ...rows].join('\n')
}
