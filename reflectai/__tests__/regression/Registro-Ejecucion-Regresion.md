# Registro de Ejecución de Pruebas de Regresión

**Proyecto:** ReflectAI  
**Versión de suite:** Regresión nueva funcionalidad v2026.05.19  
**Fecha de ejecución:** 19 de mayo de 2026  
**Encargado de ejecución:** Uriel Cendón Díaz  
**Alcance ejecutado:** Validación de que la funcionalidad nueva no rompa flujos existentes al 19 de mayo de 2026  
**Tipo de pruebas realizadas:** Regresión funcional automatizada de interfaz con dependencias de API simuladas

## Resumen ejecutivo

Se reejecutó la suite separada en `__tests__/regression` para validar la funcionalidad reciente del sistema contra comportamientos que no deben romperse después de los cambios aplicados entre el 13 y el 19 de mayo de 2026.

El resultado fue **APROBADO**: 5 pruebas ejecutadas, 5 aprobadas, 0 fallidas.

La regresión mantiene el foco en el flujo de nueva sesión con intensidad alta, grounding, reanudación segura, continuación de borradores y dashboard con borradores recuperables. El pase completo también validó la cobertura global actualizada después de agregar pruebas unitarias para utilidades del wizard y preguntas IA.

Se agregó el caso **RG-05** porque las pruebas nuevas de `wizardUtils` cubren lógica interna, pero también era necesario proteger el flujo visible de reanudar un borrador y continuar guardando sobre el mismo `sessionId`. Las pruebas agregadas de integración y unidad no se listan como casos RG porque pertenecen a otro tipo de prueba; quedan reflejadas en la cobertura completa.

Archivo de prueba automatizada asociado: `__tests__/regression/newFeature.regression.test.tsx`

## Tipo de pruebas realizadas

| Tipo | Herramienta / técnica | Alcance en este pase |
|---|---|---|
| Regresión funcional de interfaz | React Testing Library + Vitest/jsdom | Flujos visibles de `NewSessionPage` y `DashboardPage` |
| Regresión de persistencia de flujo | Mocks de API de reflexión | Conservación de `sessionId`, metadata de grounding y respuestas guardadas |
| Regresión de reanudación | URL con `sessionId` y payload persistido | No reabrir sesiones completadas y continuar borradores en progreso |
| Regresión de dashboard | Mock de historial | Mostrar solo borradores recuperables y ocultar borradores vacíos/obsoletos |
| Cobertura complementaria | Vitest coverage v8 | Validación de que el pase completo mantiene thresholds globales |

No se ejecutaron en esta suite pruebas E2E en navegador real, pruebas manuales ni llamadas a servicios externos reales; esas pertenecen a integración/E2E o procedimientos manuales.

## Resultados de ejecución

| Comando | Resultado |
|---|---|
| `npm run test:regression` | 1 archivo aprobado, 5 pruebas aprobadas, 0 fallidas, duración 10.04s |
| `npm run test:coverage` | 46 archivos aprobados, 299 pruebas aprobadas, 0 fallidas, duración 116.72s |

## Casos ejecutados

| ID | Caso | Resultado |
|---|---|---|
| RG-01 | Mantiene el flujo de grounding para intensidad alta y completa la sesión | Aprobado |
| RG-02 | No reabre sesiones completadas al intentar reanudarlas desde la URL | Aprobado |
| RG-03 | Muestra alerta de borrador recuperable y conserva `sessionId` | Aprobado |
| RG-04 | No muestra borradores vacíos o anteriores a la última sesión completada | Aprobado |
| RG-05 | Reanuda un borrador en progreso y continúa con el `sessionId` original | Aprobado |

## Evidencia observada

- Una intensidad alta dispara el paso de grounding antes de continuar a propósito/control.
- El sistema persiste `SYS_GROUNDING` junto con `high_intensity_triggered`, `grounding_completed` y duración.
- El cierre de la reflexión conserva la metadata de grounding en el payload enviado al endpoint de completado.
- Una sesión ya completada redirige al dashboard y no crea una nueva sesión.
- El dashboard solo muestra alertas para borradores recuperables con respuestas y más recientes que la última sesión completada.
- Un borrador con respuestas previas se hidrata desde la URL, no crea una sesión nueva y guarda las respuestas siguientes sobre el `sessionId` original.
- La cobertura global del pase queda aprobada con 80.91% en branches.

## Ejecución manual

```bash
cd reflectai
npm run test:regression
```

Para validar regresión junto con el resto del pipeline:

```bash
npm run test:unit
npm run test:integration
npm run test:regression
npm run test:coverage
```

## Integración en CI/CD

El workflow `.github/workflows/integration-tests.yml` ejecuta la suite de regresión como paso obligatorio mediante:

```bash
npm run test:regression -- --reporter=verbose
```

## Conclusión

La nueva funcionalidad queda protegida contra regresiones críticas en el corte del 19 de mayo de 2026.
