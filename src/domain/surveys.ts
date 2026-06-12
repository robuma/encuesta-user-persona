import { personaQuestions, personaSectionTitles } from './personaQuestions'
import { questions, sectionTitles } from './questions'
import type { SurveyDefinition } from './types'

export const surveyOne: SurveyDefinition = {
  version: '1.0',
  name: 'Encuesta 1.0 · Grupo Manfred',
  route: '/',
  questions,
  sectionTitles,
  stepLabels: ['Contexto', 'Experiencia y motivación', 'Aprendizaje', 'Apoyo y reflexión'],
  sectionLabel: 'Sección',
  likertDescription: 'Usá la escala de 1 (Totalmente en desacuerdo) a 5 (Totalmente de acuerdo).',
  draftKey: 'encuesta-programacion-draft-v1',
}

export const surveyTwo: SurveyDefinition = {
  version: '2.0',
  name: 'Encuesta 2.0 · Grupo Hansell',
  route: '/persona',
  questions: personaQuestions,
  sectionTitles: personaSectionTitles,
  stepLabels: ['Datos demográficos', 'Comportamiento', 'Aspectos psicográficos', 'Motivaciones'],
  sectionLabel: 'Categoría',
  likertDescription: 'Usá la escala de 1 (Totalmente en desacuerdo) a 7 (Totalmente de acuerdo).',
  draftKey: 'encuesta-programacion-draft-v2-standardized',
}

export const surveys = [surveyOne, surveyTwo]

export function surveyByVersion(version: string): SurveyDefinition {
  return surveys.find((survey) => survey.version === version) ?? surveyOne
}
