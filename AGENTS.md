---
name: codespaces-workflow
description: Reglas estrictas para el flujo de trabajo en GitHub Codespaces para el proyecto Bonbon Flowers.
trigger: always_on
---

# Reglas del Proyecto Bonbon Flowers

Al asistir en este proyecto, el agente de IA **DEBE** adherirse estrictamente a las siguientes reglas, dado que el entorno es un GitHub Codespaces optimizado y el despliegue se hace directamente a Vercel.

## 1. Restricciones de Ejecución Local (CRÍTICO)
- **NO ejecutes `npm install` ni modifiques `package.json`** a menos que el usuario lo solicite explícitamente. Las dependencias ya están instaladas o se instalan en el paso de CI de Vercel. Evita consumir recursos innecesarios en el Codespace.
- **NO inicies servidores de desarrollo locales** (como `npm run dev`). No probamos localmente visualizando puertos. Todo se prueba subiendo los cambios al repositorio.

## 2. Flujo de Validación y Despliegue
- El flujo de trabajo oficial es: **Planear -> Escribir Código -> Validar -> Commit -> Push**.
- **Validación Obligatoria:** Antes de hacer cualquier commit, DEBES validar el código estáticamente ejecutando:
  ```bash
  npx tsc --noEmit
  ```
- **Cero Errores:** No se permite hacer commit si TypeScript reporta errores. Si hay errores, debes solucionarlos primero.
- **Despliegue:** Una vez validado, haz commit de los cambios con mensajes convencionales (ej. `feat: ...`, `fix: ...`) y haz push directamente a la rama `main` (`git push origin main`), lo cual detonará el despliegue automático en Vercel.

## 3. Convenciones de Código
- **Next.js App Router:** Todo el desarrollo debe respetar la arquitectura del App Router de Next.js.
- **Estilos:** Se utiliza Tailwind CSS. No introduzcas archivos de CSS tradicionales sin necesidad. Usa la paleta de colores existente (ej. `#FF97A4` para el rosa característico, `#163422` para el verde oscuro).
- **Componentes:** Prefiere Server Components por defecto, y añade `"use client"` únicamente en los archivos que requieran interactividad del usuario o hooks de React (como `useState` o `useEffect`).
- **Base de Datos:** Se utiliza Mongoose. Todas las Server Actions que interactúen con la base de datos deben llamar a `await dbConnect()` al inicio.
