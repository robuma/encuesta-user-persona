export type QuestionId = string
export type Answer = string | number | string[] | { value: string; detail?: string }
export type SurveyAnswers = Partial<Record<QuestionId, Answer>>

export interface SurveyQuestion {
  id: QuestionId
  number: number
  label?: string
  section: number
  step: number
  type: 'single' | 'multi' | 'conditional' | 'likert' | 'short' | 'open' | 'select' | 'location'
  text: string
  options?: string[]
  detailWhen?: string[]
  detailLabel?: string
  chartOptions?: 'all' | 'observed'
  resultValue?: 'full' | 'province' | 'district'
}

export interface SurveyDefinition {
  version: string
  name: string
  route: string
  questions: SurveyQuestion[]
  sectionTitles: Record<number, string>
  stepLabels: string[]
  sectionLabel: string
  likertDescription: string
  draftKey: string
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
