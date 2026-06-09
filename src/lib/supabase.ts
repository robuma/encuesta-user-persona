import { createClient } from '@supabase/supabase-js'
import type { SurveyAnswers, SurveyResponse } from '../domain/types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const isSupabaseConfigured = Boolean(url && key)
const supabase = isSupabaseConfigured ? createClient(url!, key!) : null

export async function submitSurvey(answers: SurveyAnswers) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { error } = await supabase.from('survey_responses').insert({ survey_version: '1.0', answers })
  if (error) throw error
}

export async function fetchResponses(): Promise<SurveyResponse[]> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { data, error } = await supabase.from('survey_responses').select('*').order('submitted_at', { ascending: false })
  if (error) throw error
  return data as SurveyResponse[]
}
