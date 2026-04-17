# Project Charter: ReflectAI

## 1. Información del Proyecto
### Datos
| Empresa / Organización | Universidad Veracruzana - Licenciatura en Ingeniería de Software |
| :--- | :--- |
| **Proyecto** | Desarrollo de Plataforma Web "ReflectAI" para el Acompañamiento y Registro de Reflexión Personal |
| **Fecha de preparación** | 8 de Abril de 2026 |
| **Cliente** | Dra. María de Lourdes Hernández Rodríguez |
| **Patrocinador Principal** | Dra. Lizbeth Alejandra Hernández González |
| **Gerente de Proyecto** | Erickmel Vázquez López |

### Patrocinador
| Nombre | Cargo |
| :--- | :--- |
| Dra. María de Lourdes Hernández Rodríguez | Titular de la Experiencia Educativa de Administración de Proyectos de Software |
| Dra. Lizbeth Alejandra Hernández González| Jefa de Carrera de la Licenciatura en Ingeniería de Software |

---

## 2. Propósito y Justificación del Proyecto
El proyecto **ReflectAI** surge como una respuesta a la necesidad de contar con una herramienta digital estructurada que dé trazabilidad al proceso de introspección personal. Actualmente, las personas que buscan mejorar su autoconocimiento suelen utilizar medios informales (diarios físicos o notas desorganizadas) que dificultan la identificación objetiva de patrones recurrentes en emociones, detonantes y pensamientos.

El proyecto funcionará como un espacio guiado e interactivo basado en flujos dinámicos generados por Inteligencia Artificial, donde el usuario podrá registrar experiencias y analizar la relación entre sus situaciones, pensamientos y emociones. 

El valor generado para la institución y el equipo desarrollador radica en la aplicación práctica de marcos de trabajo ágiles (Scrum) y arquitecturas modernas (Serverless / Backend-as-a-Service), integrando módulos de IA de baja latencia en un Producto Mínimo Viable (MVP) funcional, seguro y escalable, evidenciando así las competencias requeridas en la Experiencia Educativa.

---

## 3. Objetivos
### Objetivos generales
Desarrollar y desplegar en producción un MVP de la plataforma web "ReflectAI" en un periodo de 8 semanas, utilizando un enfoque arquitectónico Serverless y servicios en la nube, para proporcionar a los usuarios una herramienta que permita estructurar, consultar y comparar sus sesiones de reflexión personal.

### Objetivos específicos
* **En 8 semanas (aprox. 280 horas de trabajo total del equipo)**, entregar una aplicación web funcional con: gestión de usuarios, motor dinámico de reflexión asistido por IA, historial y dashboard comparativo.
* **Al finalizar el Sprint 2 (Semana 4)**, lograr la integración total con la API de Groq para garantizar que la generación y transición de preguntas guiadas se realice con una latencia inferior a 500 milisegundos.
* **A lo largo del proyecto**, mantener el 100% de la infraestructura y servicios de base de datos (Vercel, Supabase, Groq) operando dentro de las capas gratuitas (*Free Tier*).
* **Antes de la liberación**, implementar políticas de Row Level Security (RLS) en la base de datos para asegurar que ningún usuario pueda acceder a la información de las sesiones de reflexión de un tercero.

---

## 4. Premisas y Restricciones
### Premisas
* El equipo de desarrollo (5 integrantes) contará con una disponibilidad promedio de 7 horas semanales por persona a lo largo de 8 semanas.
* Se utilizará Next.js como framework *Full-Stack* para unificar el lenguaje (TypeScript) y agilizar el desarrollo mediante un monorepo.
* El motor de IA (Groq) y el BaaS (Supabase) mantendrán sus políticas de uso gratuito vigentes durante el periodo de desarrollo.

### Restricciones
* **Tiempo:** Límite estricto de 8 semanas (4 Sprints) para el desarrollo y despliegue del MVP.
* **Legal/Ética:** Inclusión obligatoria de un aviso indicando explícitamente que ReflectAI no es una herramienta clínica ni sustituye atención psicológica profesional.
* **Técnica:** Uso obligatorio de la arquitectura aprobada: Next.js, Tailwind CSS y Supabase (PostgreSQL con uso intensivo de `JSONB`).
* **Económica:** Presupuesto de $0.00 MXN para infraestructura tecnológica.

---

## 5. Descripción del Proyecto y Entregables
La solución tecnológica se apoyará en una arquitectura Serverless. Se desarrollará por iteraciones utilizando Scrum:

**Entrega Nº 1 - Sprint 1 (Semanas 1–2): Cimientos y Acceso**
* Configuración del monorepo, linters y CI/CD en Vercel.
* Diseño base UI/UX (Mobile-First) con Tailwind CSS.
* Integración de Supabase Auth (Inicio de sesión seguro, registro, recuperación de contraseña).

**Entrega Nº 2 - Sprint 2 (Semanas 3–4): Motor de Reflexión (Core)**
* Estructuración de base de datos relacional/documental (`JSONB` para payload de sesiones).
* Integración de Groq API para la generación de flujos de preguntas dinámicas.
* Guardado asíncrono de sesiones (estados: borrador y completado).

**Entrega Nº 3 - Sprint 3 (Semanas 5–6): Historial y Visualización**
* Módulo de consulta de historial ordenado cronológicamente.
* Desarrollo de consultas SQL especializadas para extraer datos del `JSONB` y generar métricas.
* Dashboard básico de tendencias emocionales frecuentes.

**Entrega Nº 4 - Sprint 4 (Semanas 7–8): Comparativa y Pulido Final**
* Lógica para comparar dos o más sesiones a lo largo del tiempo.
* Pruebas funcionales y de seguridad (verificación de RLS en base de datos).
* Inclusión de los disclaimers éticos y legales en la UI.
* Despliegue de la versión final en producción.

---

## 6. Requerimientos de Alto Nivel
### Requisitos del Producto
* **(CU-01)** Debe permitir el inicio de sesión seguro y la gestión del perfil de usuario.
* **(CU-02)** Debe proveer un motor de reflexión guiada que genere preguntas contextuales con latencia menor a 500ms.
* **(CU-03)** Debe mostrar el historial de sesiones y un dashboard con gráficas de tendencias emocionales.
* **(CU-04)** Debe permitir la comparación directa entre los resultados de múltiples sesiones.

### Requerimientos del Proyecto
* **Privacidad (RNF-02):** Implementación de políticas de seguridad estricta a nivel de fila (RLS) en PostgreSQL.
* **UI/UX (RNF-04):** Diseño responsivo (Mobile-First) y estética minimalista para evitar distracciones durante la reflexión.
* Cumplir con la documentación básica: modelo de datos (ER), diagrama de arquitectura y manual de usuario.

---

## 7. Riesgos iniciales de Alto Nivel

### Tabla de riesgos y mitigaciones
| Riesgo | Tipo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- | :--- |
| **Vendor Lock-in / Dependencia de BaaS:** Fallos en Supabase o Groq que inhabiliten el sistema. | Técnico | Baja | Alta | Separar la lógica de negocio en servicios dentro de Next.js para facilitar la migración futura si fuera necesario. |
| **Consultas JSONB complejas:** Dificultad para extraer datos para el Dashboard de forma eficiente. | Técnico | Media | Alta | Diseño cuidadoso de la estructura del objeto `ai_analysis` para almacenar datos pre-calculados y evitar *queries* pesadas. |
| **Baja disponibilidad del equipo:** No cumplir la cuota de 7 hrs semanales por carga académica externa. | Operativo | Alta | Alta | Sprints cortos, tareas atómicas y tablero Kanban visible para todo el equipo. |
| **Exceder límites de Free Tier:** Cobros inesperados por superar peticiones a la API o almacenamiento. | Económico | Media | Media | Configurar alertas de consumo en Vercel, Supabase y Groq. Limitar el uso de tokens enviados a la IA. |

---

## 8. Cronograma de Hitos principales

| Hito | Fecha (Semana) |
| :--- | :--- |
| Inicio del Proyecto y Aprobación del Charter | Semana 0 |
| Cimientos, Autenticación y CI/CD configurado | Fin de Semana 2 (Sprint 1) |
| Motor de Reflexión con IA funcional | Fin de Semana 4 (Sprint 2) |
| Historial y Dashboard de tendencias | Fin de Semana 6 (Sprint 3) |
| Comparador, Pruebas y Despliegue a Producción | Fin de Semana 8 (Sprint 4) |

---

## 9. Inversión
*Nota: Costos calculados como esfuerzo simulado para fines académicos ($200 MXN / hora).*

| Rol | Cantidad | Costo x Hora Estimado | Horas totales (7h x 8 semanas) | Costo Total ($) |
| :--- | :--- | :--- | :--- | :--- |
| PM / Scrum Master | 1 | $200 | 56 hrs | $11,200 |
| Arquitecto de Software | 1 | $200 | 56 hrs | $11,200 |
| QA / Tester | 1 | $200 | 56 hrs | $11,200 |
| Backend / DBA | 1 | $200 | 56 hrs | $11,200 |
| Frontend / UX | 1 | $200 | 56 hrs | $11,200 |
| **Infraestructura Cloud** | N/A | $0 (Free Tiers) | N/A | $0 |
| **INVERSIÓN TOTAL ESTIMADA:** | | | **280 horas** | **$56,000 MXN** |

---

## 10. Lista de interesados (Stakeholders)
| Organización / Grupo | Nombre / Interesado |
| :--- | :--- |
| Universidad Veracruzana | Dra. María de Lourdes Hernández Rodríguez (Patrocinador) |
| Equipo de Proyecto | Erick, Eugenio, Uriel, Miguel, Arturo |
| Mercado Objetivo | Usuarios finales buscando autoconocimiento |

---

## 11. Requisitos de aprobación del Proyecto
* El sistema debe desplegarse exitosamente en Vercel y operar bajo el dominio de producción.
* La funcionalidad de registro de sesiones debe integrar exitosamente la API de IA (Groq) cumpliendo el límite de latencia.
* La base de datos en Supabase debe demostrar que las reglas de seguridad impiden cruce de datos entre usuarios.
* El código fuente debe encontrarse versionado en el repositorio oficial y cumplir con las pruebas de aseguramiento de calidad.

---

## 12. Gerente de Proyecto, Personal y Recursos

| Recurso (Nombre) | Rol a ejecutar |
| :--- | :--- |
| **Erickmel Vázquez López** | Gerente de Proyecto / Scrum Master / DevOps |
| **Eugenio Salvador González Sánchez** | Arquitecto de Software |
| **Miguel Eduardo Escobar Ladrón de Guevara** | Backend Developer / DBA |
| **Arturo Agustín Cuevas Pérez** | Frontend Developer / UX y UI |
| **Uriel Cendón Díaz** | QA y Tester |

---

## 13. Aprobación del Acta

| Nombre | Función | Fecha | Firma |
| :--- | :--- | :--- | :--- |
| **Dra. María de Lourdes Hernández R.** | Patrocinador | ____ / ____ / 2026 | _________________ |
| **Dra. Lizbeth Alejandra Hernández G.** | Patrocinador | ____ / ____ / 2026 | _________________ |
| **Erickmel Vázquez López** | Gerente del Proyecto | ____ / ____ / 2026 | _________________ |