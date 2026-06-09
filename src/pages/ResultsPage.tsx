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
  characterizationQuestions,
  questions,
  sectionTitles,
} from "../domain/questions";
import {
  filterResponses,
  likertDistribution,
  optionDistribution,
  responsesToCsv,
} from "../domain/results";
import { answerValue } from "../domain/survey";
import type { ResultFilters, SurveyResponse } from "../domain/types";
import { fetchResponses } from "../lib/supabase";

const initialFilters: ResultFilters = {
  from: "",
  to: "",
  questionId: "",
  value: "",
};
const downloadCsv = (responses: SurveyResponse[]) => {
  const blob = new Blob([`\uFEFF${responsesToCsv(responses)}`], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resultados-encuesta-${costaRicaDateKey(new Date().toISOString())}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
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
  const filtered = useMemo(
    () => filterResponses(responses, filters),
    [responses, filters],
  );
  const filterQuestion = characterizationQuestions.find(
    (question) => question.id === filters.questionId,
  );
  const chartQuestions = questions.filter(
    (question) => question.type !== "open",
  );
  const openQuestions = questions.filter(
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
        <button onClick={() => downloadCsv(filtered)}>Exportar a CSV</button>
      </header>
      <main className="dashboard-content">
        <section className="metrics">
          <article>
            <span>Respuestas visibles</span>
            <strong>{filtered.length}</strong>
            <small>de {responses.length} recibidas</small>
          </article>
          <article>
            <span>Último envío</span>
            <strong>
              {responses[0]
                ? formatCostaRicaDate(responses[0].submitted_at)
                : "—"}
            </strong>
            <small>Fecha más reciente</small>
          </article>
          <article>
            <span>Completitud</span>
            <strong>100%</strong>
            <small>Encuestas enviadas completas</small>
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
              {characterizationQuestions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.number}. {question.text}
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
              {filterQuestion?.options?.map((option) => (
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
        {responses.length === 0 ? (
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
                    ? likertDistribution(filtered, question.id)
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
                        {question.number}. {question.text}
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
                    {question.number}. {question.text}
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
                          {q.number}. {sectionTitles[q.section]}
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
                            {String(answerValue(response.answers[q.id]) ?? "")}
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
