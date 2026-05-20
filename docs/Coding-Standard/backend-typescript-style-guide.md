# Estandar de Codigo y Estilo para Backend con Next.js y TypeScript

Este documento define las reglas de arquitectura, codificacion, seguridad, pruebas y calidad para el backend de ReflectAI. Aplica a Route Handlers de Next.js, servicios server-side, integraciones con Supabase, integraciones con proveedores de IA, validaciones, errores, logging, pruebas API e integracion.

El objetivo principal es la correctitud: el codigo debe ser seguro, comprobable, tipado, observable y mantenible. Las convenciones actuales del sistema se respetan cuando son sanas; cuando una convencion existente contradiga este estandar, debe corregirse gradualmente y documentarse en los reportes de revision.

---

## 1. Alcance

Este estandar aplica a:

- `src/app/api/**/route.ts`.
- `src/app/auth/**/route.ts`.
- `src/lib/api/**`.
- `src/lib/auth/**`.
- `src/lib/ai/**`.
- `src/lib/copy/**`.
- `src/lib/monitoring/**`.
- `src/lib/profile/**`.
- `src/lib/reflection/**`.
- `src/lib/security/**`.
- `src/lib/supabase/**`.
- `src/lib/validations/**`.
- Pruebas backend en `__tests__/api/**`, `__tests__/integration/**`, `__tests__/lib/**` y `__tests__/validations/**`.
- Configuracion compartida que afecta backend: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `sonar-project.properties` y workflows CI.

Quedan fuera de este estandar los componentes React, paginas visuales y estilos, salvo cuando consumen directamente contratos backend.

---

## 2. Principios Generales

- **Correctitud antes que conveniencia:** no se acepta codigo ambiguo, inseguro o no verificable solo porque ya exista en el sistema.
- **Fail-fast:** validar configuracion, entradas y precondiciones antes de ejecutar efectos secundarios.
- **Separacion de responsabilidades:** Route Handlers adaptan HTTP; la logica de negocio debe vivir en servicios o helpers server-side.
- **Tipado estricto:** no usar `any`; usar `unknown` y narrowing explicito.
- **Errores controlados:** toda falla esperada debe traducirse a una respuesta HTTP estable.
- **Seguridad por defecto:** origen, autenticacion, autorizacion, rate limit y validacion deben ser explicitos.
- **Observabilidad responsable:** registrar errores server-side sin filtrar secretos ni datos sensibles.
- **Pruebas trazables:** cada contrato critico debe tener pruebas de exito, fallo y seguridad cuando aplique.

---

## 3. Idioma y Copy

### 3.1. Codigo fuente

Identificadores, nombres de archivos, funciones, tipos, helpers, comentarios internos y constantes tecnicas deben escribirse en ingles.

Correcto:

```ts
export async function requireAuthenticatedUser() {}
export function buildErrorResponse() {}
```

Incorrecto:

```ts
export async function obtenerUsuarioAutenticado() {}
export function construirRespuestaDeError() {}
```

### 3.2. Copy visible al usuario

ReflectAI puede presentar mensajes al usuario en espanol. Estos mensajes deben vivir en catalogos centralizados, no dispersos dentro de rutas o servicios.

Correcto:

```ts
return buildSuccessResponse({
  message: apiMessages.auth.loginSucceeded,
});
```

Incorrecto:

```ts
return NextResponse.json({
  message: 'Sesion iniciada correctamente',
});
```

### 3.3. Excepcion aceptada

Terminos de dominio que se almacenan o muestran al usuario pueden estar en espanol si forman parte del contrato de producto, por ejemplo preguntas del flujo de reflexion. Deben estar centralizados y documentados.

---

## 4. Arquitectura Backend

### 4.1. Capas recomendadas

- `routes`: adaptacion HTTP, lectura de parametros, respuesta JSON y delegacion.
- `services`: casos de uso y reglas de negocio.
- `repositories`: acceso a Supabase o proveedores persistentes.
- `schemas`: validacion de entrada/salida con Zod.
- `errors`: errores tipados y traduccion a HTTP.
- `copy`: mensajes de API y copy visible al usuario.
- `monitoring`: logging y adaptadores de observabilidad.
- `security`: origen, rate limit, sanitizacion y utilidades de proteccion.
- `supabase`: creacion de clientes y validacion de variables de entorno.

### 4.2. Route Handlers

Los Route Handlers deben ser pequenos adaptadores HTTP. Su responsabilidad permitida es:

- Validar origen cuando la ruta muta estado.
- Aplicar rate limit.
- Parsear y validar entrada mediante helpers.
- Exigir usuario autenticado cuando aplique.
- Delegar a servicio/helper server-side.
- Traducir el resultado a respuesta JSON.
- Traducir errores mediante `toRouteErrorResponse`.

No deben concentrar logica extensa de negocio, normalizacion compleja de errores de proveedor, consultas repetidas o transformaciones grandes de datos.

Patron recomendado:

```ts
export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'domain:action',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    const input = await parseJsonBody({
      request,
      schema: actionSchema,
      invalidMessage: apiMessages.common.invalidData,
    });
    const result = await performAction(input);

    return buildSuccessResponse({
      data: result,
      message: apiMessages.domain.actionSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(error, apiMessages.domain.actionUnexpected);
  }
}
```

---

## 5. Helpers Canonicos del Proyecto

Las rutas backend deben preferir los helpers compartidos existentes:

- `RouteError` para errores HTTP esperados.
- `throwRouteError` para cortar ejecucion con estado HTTP conocido.
- `buildSuccessResponse` y `buildErrorResponse` para respuestas JSON.
- `readJsonBody` y `parseJsonBody` para entrada JSON.
- `requireAuthenticatedUser` para rutas autenticadas.
- `enforceTrustedMutationOrigin` para mutaciones.
- `enforceRateLimit` y `rateLimitResponse` para rate limit.
- `toRouteErrorResponse` para traduccion final de errores.
- `apiMessages` para mensajes de API.
- `logServerError` para logging server-side.
- `getSupabasePublicEnv` y `createAdminSupabaseClient` para variables Supabase fail-fast.

Si un helper no cubre un caso nuevo, se debe extender el helper o crear uno equivalente en `src/lib/**`; no duplicar patrones en cada route handler.

---

## 6. TypeScript Estricto

`tsconfig.json` debe habilitar y mantener:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Reglas:

- Prohibido `any`, `as any` y `<any>`.
- Usar `unknown` para entradas externas, errores y payloads no validados.
- Todo narrowing debe ser explicito.
- Las funciones exportadas deben tener tipos de entrada y salida claros cuando la inferencia no sea obvia.
- Evitar casts amplios; si un cast es necesario, debe estar cerca de una validacion o una frontera con libreria externa.

---

## 7. Validacion y Contratos

Toda entrada externa debe validarse antes de usarse:

- Body JSON: `parseJsonBody` + schema Zod.
- Query params: schema o helper equivalente.
- Route params: validacion explicita de UUID/ID si aplica.
- FormData/files: validar presencia, tipo, tamano y firma binaria cuando aplique.
- Respuestas de proveedores externos: parseo defensivo y fallback controlado.

Reglas:

- No confiar en datos del cliente.
- No aceptar `user_id` del body para decidir propiedad de recursos.
- El usuario propietario debe derivarse de la sesion autenticada.
- Los payloads JSONB deben conservar version, estructura y compatibilidad hacia atras.

---

## 8. Errores y Respuestas HTTP

### 8.1. Errores esperados

Usar `RouteError` o `throwRouteError` para errores esperados:

- `400` entrada invalida.
- `401` usuario no autenticado.
- `403` origen no permitido o accion prohibida.
- `404` recurso inexistente u ocultado por seguridad.
- `409` conflicto de estado.
- `429` rate limit.
- `500` fallas internas o de proveedor no recuperables.

### 8.2. Errores inesperados

Toda ruta debe finalizar con:

```ts
} catch (error: unknown) {
  return toRouteErrorResponse(error, apiMessages.domain.unexpected);
}
```

### 8.3. Reglas prohibidas

- Prohibido `catch {}`.
- Prohibido `.then().catch()` en flujos async propios.
- Prohibido `request.json().catch(...)` en route handlers.
- Prohibido devolver errores crudos de Supabase, Groq u otros proveedores al cliente.

---

## 9. Seguridad

### 9.1. Autenticacion y autorizacion

- Toda ruta privada debe llamar `requireAuthenticatedUser`.
- Toda consulta de recursos por usuario debe filtrar por `user_id` del usuario autenticado.
- Para recursos ajenos se permite responder `404` si se quiere evitar revelar existencia.
- Acciones sensibles deben reautenticar o verificar password cuando aplique.

### 9.2. Origen y CSRF basico

- Toda mutacion debe llamar `enforceTrustedMutationOrigin`.
- Los origenes permitidos deben venir de configuracion validada.

### 9.3. Rate limit

- Rutas de autenticacion, recuperacion, cambio de password, eliminacion de cuenta, IA y mutaciones principales deben usar `enforceRateLimit`.
- Los keys deben ser especificos por dominio y accion.
- Cuando sea posible, agregar identificador de usuario o correo para limites por cuenta.

### 9.4. Variables de entorno y secretos

- Prohibido hardcodear secrets.
- Prohibido `process.env.X!`.
- Variables requeridas deben validarse fail-fast con helpers.
- La aplicacion debe fallar con mensaje claro si falta configuracion critica.

### 9.5. Archivos y avatares

- Validar tipo MIME.
- Validar tamano.
- Validar firma binaria.
- Usar rutas de storage por usuario.
- No exponer rutas privadas sin URL firmada o control de acceso.

---

## 10. Supabase

Reglas:

- Usar `createServerSupabaseClient` para contexto autenticado server-side.
- Usar `createAdminSupabaseClient` solo en operaciones que requieren privilegios de servicio.
- Usar `getSupabasePublicEnv` para variables publicas.
- El cliente admin debe validar `SUPABASE_SERVICE_ROLE_KEY` fail-fast.
- Nunca usar el service role key en codigo cliente.
- RLS debe seguir siendo una defensa activa, aunque la API tambien filtre por `user_id`.

---

## 11. IA y Proveedores Externos

Reglas:

- El cliente Groq debe validar `GROQ_API_KEY` fail-fast.
- Toda respuesta IA debe parsearse defensivamente.
- Si la IA falla y existe fallback local, el fallback debe ser determinista, seguro y testeado.
- No enviar datos innecesarios al proveedor.
- Limitar longitud de contexto enviado a IA.
- No presentar respuestas IA como consejo clinico.
- Guardar metadata suficiente para trazabilidad sin almacenar secretos.

---

## 12. Logging y Observabilidad

Reglas:

- Las rutas no deben llamar `console.*` directamente.
- Usar `logServerError` o adaptador equivalente.
- El logger no debe imprimir secretos, tokens, passwords ni payloads sensibles.
- En tests, el logger debe ser silencioso o mockeable.
- Para produccion, se recomienda Sentry, proveedor de logs o logger estructurado.

El uso de `console.error` solo es aceptable dentro del adaptador de logging mientras no exista proveedor externo, y debe estar documentado como deuda tecnica.

---

## 13. Estilo de Codigo

- Indentacion de 2 espacios.
- Comillas simples.
- Punto y coma obligatorio.
- Linea maxima de 100 caracteres.
- Imports ordenados: librerias externas, tipos externos, alias internos, tipos internos.
- Evitar funciones mayores a 50 lineas salvo casos justificados.
- Complejidad ciclomatica maxima de 10 por funcion.
- Preferir early returns y helpers pequenos.
- No duplicar strings de mensajes; usar catalogos.
- No duplicar validaciones; usar schemas y helpers.

---

## 14. Pruebas Backend

### 14.1. Tipos de pruebas esperadas

- Unitarias de helpers puros en `__tests__/lib/**`.
- Pruebas de validaciones Zod en `__tests__/validations/**`.
- Pruebas de rutas API en `__tests__/api/**`.
- Pruebas de integracion critica en `__tests__/integration/**`.
- Pruebas de regresion funcional cuando un cambio backend impacta flujos de usuario.

La carpeta central `__tests__` es aceptada para este proyecto, siempre que los nombres sean claros y exista trazabilidad con modulo/ruta.

### 14.2. Cobertura minima por contrato critico

Cada ruta critica debe cubrir:

- Camino exitoso.
- Payload invalido.
- Usuario no autenticado si aplica.
- Recurso inexistente si aplica.
- Recurso ajeno/RLS si aplica.
- Error del proveedor o persistencia si aplica.
- Rate limit/origen no confiable en rutas sensibles.
- Fallback IA si aplica.

### 14.3. Mocks

- Mockear Supabase y Groq con `vi.mock`.
- Los mocks deben representar exito y fallo.
- Evitar mocks tan estrechos que impidan modelar errores reales.
- Los tests deben validar contratos observables, no detalles incidentales.

### 14.4. Cobertura

Minimos globales:

- Statements >= 80%.
- Branches >= 80%.
- Functions >= 80%.
- Lines >= 80%.

Estos umbrales se evaluan de forma global, alineados con el Quality Gate por defecto de SonarCloud. Si la cobertura global cumple, el criterio de cobertura se considera cumplido aunque archivos individuales queden por debajo del umbral.

Para rutas criticas nuevas se espera cobertura significativa de branches como criterio de revision tecnica, pero no como Quality Gate por archivo.

---

## 15. CI/CD y Quality Gate

El pipeline debe ejecutar:

1. `npm run lint`.
2. `npm run typecheck`.
3. `npm run test:unit`.
4. `npm run test:integration`.
5. `npm run test:regression`.
6. `npm run test:coverage`.
7. Verificacion de rutas criticas.
8. SonarQube o herramienta equivalente cuando este disponible.

Quality Gate esperado:

- Cobertura global >= 80%, alineada con el Quality Gate por defecto de SonarCloud. El gate aplica al resultado global, no a cada archivo individual.
- Duplicacion <= 3%.
- Sin vulnerabilidades criticas.
- Sin secretos hardcodeados.
- Sin errores de TypeScript.
- Sin errores ESLint.

---

## 16. Checklist para Revision Backend

Cada reporte de revision debe incluir:

- Fecha de revision.
- Commit o estado bajo prueba.
- Estandar usado.
- Alcance exacto.
- Comandos ejecutados y resultado.
- Cobertura global.
- Resultado de complejidad.
- Revision de `.catch()`, `catch {}`, `any`, `process.env.*!`, `console.*` y secrets.
- Seguimiento de hallazgos del reporte anterior.
- Resumen de cumplimiento por regla.
- Discrepancias detalladas.
- Revision archivo por archivo.
- Recomendacion priorizada.
- Conclusion con estado general: cumple, cumple parcialmente o no cumple.

---

## 17. Excepciones Permitidas

Una excepcion solo es valida si queda documentada en el reporte o en el codigo con una razon tecnica clara.

Excepciones aceptables:

- Copy visible al usuario en espanol, siempre que viva en catalogos centralizados.
- `console.error` dentro de un adaptador unico de logging mientras no exista proveedor externo.
- Tests centralizados en `__tests__` por convencion actual del proyecto.
- Responder `404` en lugar de `403` para ocultar existencia de recursos ajenos.

Excepciones no aceptables:

- `any`.
- Secrets hardcodeados.
- `process.env.*!`.
- Route handlers con logica de negocio extensa sin plan de extraccion.
- Mutaciones sin validacion de origen.
- Rutas privadas sin autenticacion.
- Recursos de usuario sin filtro por propietario.
