import type { SurveyQuestion } from './types'

const likert7 = ['1', '2', '3', '4', '5', '6', '7']
const ages = Array.from({ length: 83 }, (_, index) => String(index + 17))
const q = (
  id: string,
  number: number,
  label: string,
  section: number,
  text: string,
  type: SurveyQuestion['type'],
  options?: string[],
): SurveyQuestion => ({ id, number, label, section, step: section, text, type, options })

export const personaSectionTitles: Record<number, string> = {
  0: 'Datos demográficos',
  1: 'Comportamiento',
  2: 'Aspectos psicográficos',
  3: 'Motivaciones',
}

export const personaQuestions: SurveyQuestion[] = [
  q('d01', 1, 'D1', 0, '¿Con qué género te identificas?', 'single', ['Femenino', 'Masculino', 'No binario', 'Prefiero no decirlo']),
  { ...q('d02', 2, 'D2', 0, '¿Cuál es tu edad?', 'select', ages), chartOptions: 'observed' },
  { ...q('d03', 3, 'D3', 0, '¿Cuál es tu lugar de residencia?', 'location'), chartOptions: 'observed', resultValue: 'province' },
  q('d04', 4, 'D4', 0, '¿Qué equipo usas para estudiar programación? Podés marcar varias opciones.', 'multi', ['Portátil', 'Computadora de escritorio', 'Tableta', 'Celular']),
  q('d05', 5, 'D5', 0, '¿Qué tipo de conexión a Internet usas principalmente?', 'single', ['Cable', 'Datos móviles', 'WiFi gratuito']),
  q('d06', 6, 'D6', 0, '¿En qué año de carrera estás?', 'single', ['Primer año', 'Segundo año', 'Tercer año', 'Cuarto año o más']),
  q('b01', 7, 'B1', 1, 'Considero que usar IA generativa para aprender Python es beneficioso.', 'likert', likert7),
  q('b02', 8, 'B2', 1, 'Pienso continuar usando IA generativa para aprender programación.', 'likert', likert7),
  q('b03', 9, 'B3', 1, 'Usaría IA generativa frecuentemente en mis estudios futuros.', 'likert', likert7),
  q('b04', 10, 'B4', 1, 'Recomendaría la IA generativa a mis compañeros para aprender programación.', 'likert', likert7),
  q('p01', 11, 'P1', 2, 'Confío en la IA para responder preguntas de programación.', 'likert', likert7),
  q('p02', 12, 'P2', 2, 'La IA es útil para que estudiantes de cursos introductorios de programación desarrollen habilidades de programación.', 'likert', likert7),
  q('p03', 13, 'P3', 2, 'La IA me ayudará a convertirme en mejor programador o programadora.', 'likert', likert7),
  q('p04', 14, 'P4', 2, 'Me preocupa que la IA dificulte conseguir empleo en el área de computación.', 'likert', likert7),
  q('p05', 15, 'P5', 2, 'Me preocupan los posibles problemas éticos, de equidad o seguridad asociados a la popularidad de la IA.', 'likert', likert7),
  q('m01', 16, 'M1', 3, 'Tenía mucha experiencia en programación antes de este curso.', 'likert', likert7),
  q('m02', 17, 'M2', 3, 'Tenía experiencia usando IA como ChatGPT antes de este curso.', 'likert', likert7),
  q('m03', 18, 'M3', 3, 'Uso regularmente IA para completar mis tareas de otras clases.', 'likert', likert7),
  q('m04', 19, 'M4', 3, 'Uso regularmente IA para completar mis tareas de este curso.', 'likert', likert7),
  q('m05', 20, 'M5', 3, 'Usar IA en este curso me está ayudando a aprender.', 'likert', likert7),
  q('m06', 21, 'M6', 3, '¿Cómo describirías el apoyo ideal que te gustaría recibir de una herramienta de IA cuando no sabés cómo avanzar?', 'open'),
]
