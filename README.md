# Encuesta de experiencia en programación

Aplicación estática con una encuesta anónima y un panel público de resultados.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configurá `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con la URL y clave pública del proyecto. Nunca uses una clave `service_role`.

## Supabase

1. Creá un proyecto en Supabase.
2. Ejecutá `supabase/migrations/20260609000000_create_survey_responses.sql` en el SQL Editor.
3. Confirmá que `public` esté expuesto en Data API.
4. Verificá que `anon` pueda insertar y leer, pero no actualizar ni eliminar.

El panel es público en `/#/resultados`. La ausencia de un enlace visible no lo convierte en privado.

## GitHub Pages

1. Publicá el proyecto en un repositorio con rama `main`.
2. En **Settings → Pages**, elegí **GitHub Actions**.
3. Creá la variable `VITE_SUPABASE_URL`.
4. Creá el secret `VITE_SUPABASE_PUBLISHABLE_KEY`.

Cada push a `main` ejecutará pruebas, compilará y desplegará la aplicación.
