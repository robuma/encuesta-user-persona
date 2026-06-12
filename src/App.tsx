import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { DocumentTitle } from './components/DocumentTitle'
import { surveyTwo } from './domain/surveys'
import { SurveyPage } from './pages/SurveyPage'

const ResultsPage = lazy(() => import('./pages/ResultsPage').then((module) => ({ default: module.ResultsPage })))

export default function App() {
  return <HashRouter><Routes><Route path="/" element={<><DocumentTitle title="Encuesta" /><SurveyPage /></>} /><Route path="/persona" element={<><DocumentTitle title="Encuesta User Persona" /><SurveyPage survey={surveyTwo} /></>} /><Route path="/resultados" element={<><DocumentTitle title="Resultados Encuesta" /><Suspense fallback={<main className="state-page"><div className="spinner" /><h1>Cargando panel…</h1></main>}><ResultsPage /></Suspense></>} /></Routes></HashRouter>
}
