import type { Answer, SurveyAnswers, SurveyQuestion } from './types'

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0

export function answerValue(answer: Answer | undefined): string | number | string[] | undefined {
  return typeof answer === 'object' && answer !== null && !Array.isArray(answer) ? answer.value : answer
}

export function isQuestionComplete(question: SurveyQuestion, answers: SurveyAnswers): boolean {
  const answer = answers[question.id]
  if (question.type === 'conditional') {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer) || !hasText(answer.value)) return false
    return question.detailWhen?.includes(answer.value) ? hasText(answer.detail) : true
  }
  if (question.type === 'multi') return Array.isArray(answer) && answer.length > 0
  if (question.type === 'likert') return question.options?.includes(String(answer)) ?? false
  if (question.type === 'select') return question.options?.includes(String(answer)) ?? false
  if (question.type === 'location') return typeof answer === 'string' && answer.split(' > ').length === 3
  return hasText(answer)
}

export function completionPercent(questions: SurveyQuestion[], answers: SurveyAnswers): number {
  const complete = questions.filter((question) => isQuestionComplete(question, answers)).length
  return Math.round((complete / questions.length) * 100)
}

export function validateStep(questions: SurveyQuestion[], step: number, answers: SurveyAnswers): string[] {
  return questions.filter((question) => question.step === step && !isQuestionComplete(question, answers)).map((question) => question.id)
}

export function validateSurvey(questions: SurveyQuestion[], answers: SurveyAnswers): string[] {
  return questions.filter((question) => !isQuestionComplete(question, answers)).map((question) => question.id)
}
