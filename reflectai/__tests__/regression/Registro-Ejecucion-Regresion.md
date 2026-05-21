# Registro de Ejecucion de Pruebas de Regresion

**Proyecto:** ReflectAI
**Version de suite:** Regresion nueva funcionalidad v2026.05.19
**Fecha de ejecucion:** 19 de mayo de 2026
**Encargado de ejecucion:** Uriel CendÃ³n DÃ­az
**Alcance ejecutado:** Validacion de que la funcionalidad nueva no rompa flujos existentes al 19 de mayo de 2026
**Tipo de pruebas realizadas:** Regresion funcional automatizada de interfaz con dependencias de API simuladas

## Resumen ejecutivo

Se reejecuto la suite separada en `__tests__/regression` para validar la funcionalidad reciente del sistema contra comportamientos que no deben romperse despues de los cambios aplicados entre el 13 y el 19 de mayo de 2026.

El resultado fue **APROBADO**: 5 pruebas ejecutadas, 5 aprobadas, 0 fallidas.

La regresion mantiene el foco en el flujo de nueva sesiÓn con intensidad alta, grounding, reanudacion segura, continuacion de borradores y dashboard con borradores recuperables. El pase completo tambien valido la cobertura global actualizada despues de agregar pruebas unitarias para utilidades del wizard y preguntas IA.

Se agrego el caso **RG-05** porque las pruebas nuevas de `wizardUtils` cubren logica interna, pero tambien era necesario proteger el flujo visible de reanudar un borrador y continuar guardando sobre el mismo `sessionId`. Las pruebas agregadas de integracion y unidad no se listan como casos RG porque pertenecen a otro tipo de prueba; quedan reflejadas en la cobertura completa.

Archivo de prueba automatizada asociado: `__tests__/regression/newFeature.regression.test.tsx`

## Tipo de pruebas realizadas

| Tipo | Herramienta / tecnica | Alcance en este pase |
|---|---|---|
| Regresion funcional de interfaz | React Testing Library + Vitest/jsdom | Flujos visibles de `NewSessionPage` y `DashboardPage` |
| Regresion de persistencia de flujo | Mocks de API de reflexiÓn | Conservacion de `sessionId`, metadata de grounding y respuestas guardadas |
| Regresion de reanudacion | URL con `sessionId` y payload persistido | No reabrir sesiÓnes completadas y continuar borradores en progreso |
| Regresion de dashboard | Mock de historial | Mostrar solo borradores recuperables y ocultar borradores vacios/obsoletos |
| Cobertura complementaria | Vitest coverage v8 | Validacion de que el pase completo mantiene thresholds globales |

No se ejecutaron en esta suite pruebas E2E en navegador real, pruebas manuales ni llamadas a servicios externos reales; esas pertenecen a integracion/E2E o procedimientos manuales.

## Resultados de ejecucion

| Comando | Resultado |
|---|---|
| `npm run test:regression` | 1 archivo aprobado, 5 pruebas aprobadas, 0 fallidas, duracion 10.04s |
| `npm run test:coverage` | 46 archivos aprobados, 299 pruebas aprobadas, 0 fallidas, duracion 116.72s |

## Casos ejecutados

| ID | Caso | Resultado |
|---|---|---|
| RG-01 | Mantiene el flujo de grounding para intensidad alta y completa la sesiÓn | Aprobado |
| RG-02 | No reabre sesiÓnes completadas al intentar reanudarlas desde la URL | Aprobado |
| RG-03 | Muestra alerta de borrador recuperable y conserva `sessionId` | Aprobado |
| RG-04 | No muestra borradores vacios o anteriores a la ultima sesiÓn completada | Aprobado |
| RG-05 | Reanuda un borrador en progreso y continua con el `sessionId` original | Aprobado |

## Evidencia observada

- Una intensidad alta dispara el paso de grounding antes de continuar a propÓsito/control.
- El sistema persiste `SYS_GROUNDING` junto con `high_intensity_triggered`, `grounding_completed` y duracion.
- El cierre de la reflexiÓn conserva la metadata de grounding en el payload enviado al endpoint de completado.
- Una sesiÓn ya completada redirige al dashboard y no crea una nueva sesiÓn.
- El dashboard solo muestra alertas para borradores recuperables con respuestas y mÁs recientes que la ultima sesiÓn completada.
- Un borrador con respuestas previas se hidrata desde la URL, no crea una sesiÓn nueva y guarda las respuestas siguientes sobre el `sessionId` original.
- La cobertura global del pase queda aprobada con 80.91% en branches.

## Ejecucion manual

```bash
cd reflectai
npm run test:regression
```

Para validar regresion junto con el resto del pipeline:

```bash
npm run test:unit
npm run test:integration
npm run test:regression
npm run test:coverage
```

## Integracion en CI/CD

El workflow `.github/workflows/integration-tests.yml` ejecuta la suite de regresion como paso obligatorio mediante:

```bash
npm run test:regression -- --reporter=verbose
```

## Conclusion

La nueva funcionalidad queda protegida contra regresiones criticas en el corte del 19 de mayo de 2026.
