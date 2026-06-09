export type QuestionId = `q${string}`
export type Answer = string | number | { value: string; detail?: string }
export type SurveyAnswers = Partial<Record<QuestionId, Answer>>

export interface SurveyQuestion {
  id: QuestionId
  number: number
  section: number
  step: number
  type: 'single' | 'conditional' | 'likert' | 'open'
  text: string
  options?: string[]
  detailWhen?: string[]
  detailLabel?: string
}

export interface SurveyResponse {
  id: string
  survey_version: string
  answers: SurveyAnswers
  submitted_at: string
}

export interface ResultFilters {
  from: string
  to: string
  questionId: QuestionId | ''
  value: string
}
