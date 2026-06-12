import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateFilter } from "../components/DateFilter";
import {
  costaRicaDateKey,
  formatCostaRicaDate,
  formatCostaRicaDateTime,
} from "../domain/dates";
import {
  filterResponses,
  filterableQuestions,
  likertDistribution,
  observedAnswerOptions,
  observedDistribution,
  optionDistribution,
  responsesToCsv,
} from "../domain/results";
import { answerValue } from "../domain/survey";
import { surveyOne, surveys, surveyByVersion } from "../domain/surveys";
import type { ResultFilters, SurveyResponse } from "../domain/types";
import { fetchResponses } from "../lib/supabase";

const initialFilters: ResultFilters = {
  from: "",
  to: "",
  questionId: "",
  value: "",
};
const displayAnswer = (value: unknown) => Array.isArray(value) ? value.join(", ") : String(value ?? "")
const downloadCsv = (responses: SurveyResponse[], questions: typeof surveyOne.questions, version: string) => {
  const blob = new Blob([`\uFEFF${responsesToCsv(responses, questions)}`], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resultados-encuesta-${version}-${costaRicaDateKey(new Date().toISOString())}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("1.0");
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    fetchResponses()
      .then((data) => {
        setResponses(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  const survey = surveyByVersion(selectedVersion);
  const versionResponses = useMemo(
    () => responses.filter((response) => response.survey_version === selectedVersion),
    [responses, selectedVersion],
  );
  const filtered = useMemo(
    () => filterResponses(versionResponses, filters, survey.questions),
    [versionResponses, filters, survey.questions],
  );
  const characterizationQuestions = survey.questions.filter((question) => question.section === 0);
  const filterQuestions = filterableQuestions(survey.questions);
  const filterQuestion = filterQuestions.find(
    (question) => question.id === filters.questionId,
  );
  const filterOptionResponses = useMemo(
    () => filterResponses(versionResponses, { ...filters, questionId: "", value: "" }, survey.questions),
    [versionResponses, filters.from, filters.to, survey.questions],
  );
  const filterOptions = filterQuestion ? observedAnswerOptions(filterOptionResponses, filterQuestion) : [];
  const chartQuestions = survey.questions.filter(
    (question) => question.type !== "open",
  );
  const openQuestions = survey.questions.filter(
    (question) => question.type === "open",
  );
  const setFilter = (key: keyof ResultFilters, value: string) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "questionId" ? { value: "" } : {}),
    }));

  if (state === "loading")
    return (
      <main className="state-page">
        <div className="spinner" />
        <h1>Cargando resultados…</h1>
      </main>
    );
  if (state === "error")
    return (
      <main className="state-page">
        <h1>No fue posible cargar los resultados</h1>
        <p>
          Verificá la configuración y los permisos públicos de lectura en
          Supabase.
        </p>
        <button onClick={() => location.reload()}>Intentar de nuevo</button>
      </main>
    );

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Panel de resultados</p>
          <h1>Resultados de la encuesta</h1>
          <p>Vista de gráficos y resultados por pregunta</p>
        </div>
        <button onClick={() => downloadCsv(filtered, survey.questions, selectedVersion)}>Exportar a CSV</button>
      </header>
      <main className="dashboard-content">
        <section className="metrics">
          <article className="questionnaire-metric">
            <label htmlFor="survey-version">Cuestionario</label>
            <select id="survey-version" value={selectedVersion} onChange={(event) => { setSelectedVersion(event.target.value); setFilters(initialFilters) }}>
              {surveys.map((item) => <option key={item.version} value={item.version}>{item.name}</option>)}
            </select>
            <small>Resultados mostrados</small>
          </article>
          <article>
            <span>Respuestas visibles</span>
            <strong>{filtered.length}</strong>
            <small>de {versionResponses.length} recibidas</small>
          </article>
          <article>
            <span>Último envío</span>
            <strong>
              {versionResponses[0]
                ? formatCostaRicaDate(versionResponses[0].submitted_at)
                : "—"}
            </strong>
            <small>Fecha más reciente</small>
          </article>
        </section>
        <section className="filters">
          <DateFilter
            label="Desde"
            value={filters.from}
            onChange={(value) => setFilter("from", value)}
          />
          <DateFilter
            label="Hasta"
            value={filters.to}
            onChange={(value) => setFilter("to", value)}
          />
          <label>
            Filtrar por pregunta
            <select
              value={filters.questionId}
              onChange={(e) => setFilter("questionId", e.target.value)}
            >
              <option value="">Todas</option>
              {filterQuestions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.label ?? question.number}. {question.text}
                </option>
              ))}
            </select>
          </label>
          <label>
            Respuesta
            <select
              disabled={!filterQuestion}
              value={filters.value}
              onChange={(e) => setFilter("value", e.target.value)}
            >
              <option value="">Todas</option>
              {filterOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button
            className="secondary"
            onClick={() => setFilters(initialFilters)}
          >
            Limpiar filtros
          </button>
        </section>
        {versionResponses.length === 0 ? (
          <section className="empty">
            <h2>Aún no hay respuestas</h2>
            <p>
              Los resultados aparecerán aquí cuando se envíe la primera
              encuesta.
            </p>
          </section>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="section-heading">
                <span>Resumen cuantitativo</span>
                <h2>Distribuciones por pregunta</h2>
              </div>
              <div className="chart-grid">
                {chartQuestions.map((question) => {
                  const isLikert = question.type === "likert";
                  const data = isLikert
                    ? likertDistribution(filtered, question.id, question.options?.length ?? 5)
                    : question.chartOptions === "observed"
                      ? observedDistribution(filtered, question)
                    : optionDistribution(
                        filtered,
                        question.id,
                        question.options ?? [],
                      );
                  return (
                    <article
                      className={`chart-card ${isLikert ? "" : "distribution-card"}`}
                      key={question.id}
                    >
                      <h3>
                        {question.label ?? question.number}. {question.text}
                      </h3>
                      {isLikert ? (
                        <ResponsiveContainer width="100%" height={235}>
                          <BarChart
                            data={data}
                            margin={{ top: 8, left: 10, right: 12, bottom: 14 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="value"
                              interval={0}
                              height={42}
                              label={{
                                value: "Nivel de acuerdo",
                                position: "insideBottom",
                                offset: -8,
                              }}
                            />
                            <YAxis
                              allowDecimals={false}
                              label={{
                                value: "Cantidad",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              labelFormatter={(value) =>
                                `Nivel de acuerdo: ${value}`
                              }
                              formatter={(value) => [
                                value,
                                "Cantidad de respuestas",
                              ]}
                            />
                            <Bar
                              dataKey="count"
                              fill="#0878c9"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="distribution-list">
                          {data.map((item) => {
                            const count = "count" in item ? item.count : 0;
                            const option = "option" in item ? item.option : "";
                            const percent = filtered.length
                              ? Math.round((count / filtered.length) * 100)
                              : 0;
                            return (
                              <div className="distribution-row" key={option}>
                                <div className="distribution-label">
                                  <span>{option}</span>
                                  <strong>
                                    {count} · {percent}%
                                  </strong>
                                </div>
                                <div
                                  className="distribution-track"
                                  aria-label={`${option}: ${count} respuestas, ${percent}%`}
                                >
                                  <span style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <section className="dashboard-section">
              <div className="section-heading">
                <span>Respuestas cualitativas</span>
                <h2>Preguntas abiertas</h2>
              </div>
              {openQuestions.map((question) => (
                <details key={question.id} className="open-responses">
                  <summary>
                          {question.label ?? question.number}. {question.text}
                    <span>{filtered.length} respuestas</span>
                  </summary>
                  <div>
                    {filtered.map((response) => (
                      <blockquote key={response.id}>
                        {String(
                          answerValue(response.answers[question.id]) ??
                            "Sin respuesta",
                        )}
                      </blockquote>
                    ))}
                  </div>
                </details>
              ))}
            </section>
            <section className="dashboard-section">
              <div className="section-heading">
                <span>Detalle</span>
                <h2>Envíos recibidos</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Versión</th>
                      {characterizationQuestions.slice(0, 5).map((q) => (
                        <th key={q.id}>
                          {q.label ?? q.number}. {survey.sectionTitles[q.section]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((response) => (
                      <tr key={response.id}>
                        <td>
                          {formatCostaRicaDateTime(response.submitted_at)}
                        </td>
                        <td>{response.survey_version}</td>
                        {characterizationQuestions.slice(0, 5).map((q) => (
                          <td key={q.id}>
                            {displayAnswer(answerValue(response.answers[q.id]))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
