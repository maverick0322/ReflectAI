import ManualStep from '@/features/help/components/ManualStep';
import WarningIcon from '@/shared/icons/WarningIcon';
import GlassCard from '@/shared/ui/GlassCard';

const sectionHeadingClassName = [
  'text-sm font-bold uppercase tracking-tighter text-slate-900/40',
  'dark:text-dark/40',
].join(' ');

const noticeClassName = [
  'flex items-start gap-3 rounded-2xl border border-amber-200/70',
  'bg-amber-50/60 p-4 text-amber-950 shadow-sm',
].join(' ');

const noticeIconClassName = [
  'mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl',
  'border border-amber-200/70 bg-white/70',
].join(' ');

const detailsClassName = [
  'group rounded-2xl border border-white/50 bg-white/25 p-4',
  'shadow-sm backdrop-blur-md',
].join(' ');

const summaryClassName = [
  'flex cursor-pointer list-none items-center justify-between',
  'font-semibold text-slate-900 dark:text-black',
].join(' ');

export default function HelpPage() {
  return (
    <main className="mx-auto flex-1 w-full max-w-lg px-4 py-6">
      <GlassCard className="flex min-h-[90vh] flex-col gap-10 p-6 pb-32">
        <header className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Guía de usuario
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-black">
            Ayuda de ReflectAI
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Esta guía visual rápida te ayuda a recorrer la app con confianza.
            Avanza paso a paso y a tu propio ritmo.
          </p>
        </header>

        <section className="space-y-4">
          <div className={noticeClassName}>
            <div className={noticeIconClassName}>
              <WarningIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Aviso importante</p>
              <p className="text-sm leading-relaxed">
                {'ReflectAI apoya la autoconciencia y la reflexión. '}
                <span className="font-semibold">No es una herramienta clínica</span>
                {' y no sustituye la atención psicológica o psiquiátrica profesional, '}
                {'ni el diagnóstico o tratamiento. Si estás en crisis, contacta '}
                {'de inmediato a los servicios de salud mental de tu localidad.'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>1) Configura tu cuenta</h2>

          <ManualStep
            title="Crea tu cuenta"
            description={
              <>
                {'En la pantalla principal, selecciona '}
                <span className="font-semibold">Registrarme</span>.
                {' Puedes registrarte con tu correo y contraseña.'}
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Pantalla principal mostrando acceso a registro e inicio de sesión.',
              calloutText: 'Toca aquí',
              caption: 'Referencia visual: puntos de entrada para registro e inicio de sesión.',
            }}
          />

          <ManualStep
            title="Recupera el acceso"
            description={
              <>
                {'Si olvidas tu contraseña, selecciona '}
                <span className="font-semibold">¿Olvidaste tu contraseña?</span>.
                {' Te enviaremos por correo un enlace seguro para restablecerla.'}
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Pantalla de inicio de sesión mostrando la opción para recuperar contraseña.',
              calloutText: 'Toca aquí',
              caption: 'Referencia visual: opción de recuperación de contraseña.',
            }}
          />

          <ManualStep
            title="Mantenlo privado"
            description={
              <>
                Tus reflexiones te pertenecen. Una vez que inicias sesión,
                solo tú puedes acceder a tu historial.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Pantalla representativa del panel principal.',
              calloutText: 'Tip',
              caption: 'Escribe con libertad. Nadie más puede leer esto.',
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>2) Inicia una sesión de reflexión</h2>

          <ManualStep
            title="Inicia una nueva reflexión"
            description={
              <>
                {'Desde el panel principal, selecciona '}
                <span className="font-semibold">Nueva reflexión</span>.
                {' El sistema te guiará paso a paso.'}
              </>
            }
            screenshot={{
              src: '/manual/02-new-reflection.png',
              alt: 'Panel principal con el botón de Nueva reflexión resaltado.',
              calloutText: 'Toca aquí',
              caption: 'Referencia visual: botón de Nueva reflexión.',
            }}
          />

          <ManualStep
            title="Sigue el flujo"
            description={
              <>
                Responde a tu propio ritmo. Haz una pausa si la necesitas.
                Lo más importante es mantenerte honesto contigo mismo.
              </>
            }
            screenshot={{
              src: '/manual/03-question-flow.png',
              alt: 'Flujo guiado de preguntas durante una sesión de reflexión.',
              calloutText: 'Escribe aquí',
              caption: 'Referencia visual: campo de respuesta y navegación del flujo.',
            }}
          />

          <ManualStep
            title="Evalúa la intensidad"
            description={
              <>
                {'Algunas preguntas incluyen una escala del '}
                <span className="font-semibold">1 al 10</span>.
                {' Mueve el control para indicar qué tan intensa se siente la emoción ahora mismo.'}
              </>
            }
            screenshot={{
              src: '/manual/04-intensity-slider.png',
              alt: 'Control deslizante para intensidad emocional.',
              calloutText: 'Desliza aquí',
              caption: 'Referencia visual: control de intensidad del 1 al 10.',
            }}
          />

          <ManualStep
            title="Guarda tu sesión"
            description={
              <>
                {'Cuando llegues al final, selecciona '}
                <span className="font-semibold">Guardar sesión</span>.
                {' Tu progreso se almacenará de forma segura.'}
              </>
            }
            screenshot={{
              src: '/manual/03-question-flow.png',
              alt: 'Paso final de la sesión mostrando el botón para guardar.',
              calloutText: 'Guardar sesión',
              caption: 'Referencia visual: botón para guardar al final del flujo.',
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>3) Revisa tu progreso</h2>

          <ManualStep
            title="Historial"
            description={
              <>
                {'Abre '}
                <span className="font-semibold">Mis sesiones</span>
                {' para revisar tus reflexiones por fecha. Selecciona cualquier sesión para volver a leerla.'}
              </>
            }
            screenshot={{
              src: '/manual/05-my-sessions.png',
              alt: 'Pantalla de Mis sesiones con una lista de reflexiones.',
              calloutText: 'Mis sesiones',
              caption: 'Referencia visual: sesiones ordenadas por fecha.',
            }}
          />

          <ManualStep
            title="Panel de tendencias"
            description={
              <>
                {'En '}
                <span className="font-semibold">Estadísticas</span>
                {' puedes revisar gráficas que resumen la frecuencia e intensidad emocional a lo largo del tiempo.'}
              </>
            }
            screenshot={{
              src: '/manual/06-analysis.png',
              alt: 'Pestaña de estadísticas con gráficas de tendencias.',
              calloutText: 'Estadísticas',
              caption: 'Referencia visual: gráficas de frecuencia e intensidad.',
            }}
          />

          <ManualStep
            title="Compara sesiones"
            description={
              <>
                Si notas un patrón recurrente, abre la vista de comparación,
                elige dos sesiones y revísalas lado a lado.
              </>
            }
            screenshot={{
              src: '/manual/07-comparison.png',
              alt: 'Vista de comparación mostrando dos sesiones lado a lado.',
              calloutText: 'Comparar',
              caption: 'Referencia visual: comparación lado a lado.',
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className={sectionHeadingClassName}>4) Preguntas frecuentes</h2>

          <div className="space-y-3">
            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                ¿Puedo eliminar una sesión si me arrepiento de lo que escribí?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {'Sí. Abre la sesión desde tu historial y usa el botón '}
                <span className="font-semibold">Eliminar</span> al final.
              </p>
            </details>

            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                ¿Qué pasa si se corta mi conexión a internet a mitad de la sesión?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                ReflectAI guarda tu progreso temporalmente en el navegador.
                Si la conexión se corta, mantén abierta la pestaña y tus respuestas
                se sincronizarán cuando regrese la conexión.
              </p>
            </details>

            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                ¿Puedo eliminar todos mis datos?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {'Sí. Abre '}
                <span className="font-semibold">Configuración de cuenta</span>
                {' y elige '}
                <span className="font-semibold">Eliminar cuenta</span>.
                {' Esto elimina tu perfil y tus reflexiones de forma permanente.'}
              </p>
            </details>
          </div>
        </section>
      </GlassCard>
    </main>
  );
}
