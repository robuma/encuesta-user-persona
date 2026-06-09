import { questions } from './questions'
import type { Answer, SurveyAnswers, SurveyQuestion } from './types'

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0

export function answerValue(answer: Answer | undefined): string | number | undefined {
  return typeof answer === 'object' && answer !== null ? answer.value : answer
}

export function isQuestionComplete(question: SurveyQuestion, answers: SurveyAnswers): boolean {
  const answer = answers[question.id]
  if (question.type === 'conditional') {
    if (!answer || typeof answer !== 'object' || !hasText(answer.value)) return false
    return question.detailWhen?.includes(answer.value) ? hasText(answer.detail) : true
  }
  if (question.type === 'likert') return [1, 2, 3, 4, 5].includes(Number(answer))
  return hasText(answer)
}

export function completionPercent(answers: SurveyAnswers): number {
  const complete = questions.filter((question) => isQuestionComplete(question, answers)).length
  return Math.round((complete / questions.length) * 100)
}

export function validateStep(step: number, answers: SurveyAnswers): string[] {
  return questions.filter((question) => question.step === step && !isQuestionComplete(question, answers)).map((question) => question.id)
}

export function validateSurvey(answers: SurveyAnswers): string[] {
  return questions.filter((question) => !isQuestionComplete(question, answers)).map((question) => question.id)
}
