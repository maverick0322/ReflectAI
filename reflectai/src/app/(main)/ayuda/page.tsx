import ManualStep from "@/components/manual/ManualStep";
import WarningIcon from "@/components/icons/WarningIcon";
import GlassCard from "@/components/ui/GlassCard";

export default function AyudaPage() {
  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-10">
        <header className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Manual de usuario
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-black">
            Ayuda de ReflectAI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Aquí encuentras una guía rápida y visual para moverte con confianza. Ve paso a paso,
            sin prisa: esto es para ti.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 text-amber-950 shadow-sm">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 border border-amber-200/70">
              <WarningIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Aviso importante</p>
              <p className="text-sm leading-relaxed">
                ReflectAI es una herramienta de apoyo para el autoconocimiento y la autorreflexión.
                <span className="font-semibold"> No es una herramienta clínica</span> y no sustituye,
                bajo ninguna circunstancia, la atención, diagnóstico o tratamiento psicológico o psiquiátrico profesional.
                Si estás atravesando una crisis, por favor contacta a los servicios de salud mental de tu localidad.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900/40 dark:text-black/40 uppercase tracking-tighter">
            1) Primeros pasos: tu cuenta
          </h2>

          <ManualStep
            title="Crear tu cuenta"
            description={
              <>
                En la pantalla principal, selecciona <span className="font-semibold">“Registrarse”</span>.
                Puedes usar tu correo y una contraseña, o entrar con Google/Apple para hacerlo más rápido.
              </>
            }
            screenshot={{
              src: "/manual/01-dashboard.png",
              alt: "Captura del panel principal mostrando el acceso a registro e inicio.",
              calloutText: "Haz clic aquí",
              caption: "Referencia visual: acceso a registro/inicio.",
            }}
          />

          <ManualStep
            title="Recuperar acceso"
            description={
              <>
                Si olvidas tu contraseña, haz clic en <span className="font-semibold">“¿Olvidaste tu contraseña?”</span>.
                Te enviaremos un enlace seguro a tu correo.
              </>
            }
            screenshot={{
              src: "/manual/01-dashboard.png",
              alt: "Captura de la pantalla de inicio de sesión con la opción de recuperar contraseña.",
              calloutText: "Haz clic aquí",
              caption: "Referencia visual: opción “¿Olvidaste tu contraseña?”.",
            }}
          />

          <ManualStep
            title="Privacidad total"
            description={
              <>
                Tus reflexiones son solo tuyas. Al iniciar sesión, tú eres la única persona que puede acceder a tu historial.
              </>
            }
            screenshot={{
              src: "/manual/01-dashboard.png",
              alt: "Captura representativa del panel principal.",
              calloutText: "Tip",
              caption: "Recuerda: escribe con libertad. Nadie más verá esto.",
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900/40 dark:text-dark/40 uppercase tracking-tighter">
            2) Iniciar una sesión de reflexión
          </h2>

          <ManualStep
            title="Comenzar una nueva reflexión"
            description={
              <>
                Desde tu panel, haz clic en <span className="font-semibold">“Nueva Reflexión”</span>. A partir de ahí,
                el sistema te guía con preguntas paso a paso.
              </>
            }
            screenshot={{
              src: "/manual/02-nueva-reflexion.png",
              alt: "Captura del panel mostrando el botón de Nueva Reflexión.",
              calloutText: "Haz clic aquí",
              caption: "Referencia visual: botón “Nueva Reflexión”.",
            }}
          />

          <ManualStep
            title="Seguir el flujo"
            description={
              <>
                Responde a tu ritmo. Si lo necesitas, toma una pausa. Lo importante es que seas honesto contigo.
              </>
            }
            screenshot={{
              src: "/manual/03-flujo-preguntas.png",
              alt: "Captura del flujo de preguntas guiadas durante una sesión.",
              calloutText: "Escribe aquí",
              caption: "Referencia visual: campo de respuesta y navegación del flujo.",
            }}
          />

          <ManualStep
            title="Medir tu intensidad"
            description={
              <>
                En algunas preguntas, verás un control del <span className="font-semibold">1 al 10</span>.
                Mueve el deslizador para indicar cómo te sientes en ese momento exacto.
              </>
            }
            screenshot={{
              src: "/manual/04-slider-intensidad.png",
              alt: "Captura del control deslizante de intensidad emocional.",
              calloutText: "Arrastra aquí",
              caption: "Referencia visual: slider de intensidad 1–10.",
            }}
          />

          <ManualStep
            title="Guardar tu sesión"
            description={
              <>
                Cuando llegues al final, haz clic en <span className="font-semibold">“Guardar sesión”</span>. Tu progreso
                se almacena de forma segura.
              </>
            }
            screenshot={{
              src: "/manual/03-flujo-preguntas.png",
              alt: "Captura final de una sesión mostrando el botón para guardar.",
              calloutText: "Guardar sesión",
              caption: "Referencia visual: botón de guardado al final del flujo.",
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900/40 dark:text-dark/40 uppercase tracking-tighter">
            3) Revisar tu progreso
          </h2>

          <ManualStep
            title="Tu historial"
            description={
              <>
                Ve a <span className="font-semibold">“Mis Sesiones”</span> para ver tu lista de reflexiones por fecha.
                Toca una para volver a leerla.
              </>
            }
            screenshot={{
              src: "/manual/05-mis-sesiones.png",
              alt: "Captura de la sección Mis Sesiones con una lista de reflexiones.",
              calloutText: "Mis Sesiones",
              caption: "Referencia visual: lista de sesiones ordenadas por fecha.",
            }}
          />

          <ManualStep
            title="Dashboard de tendencias"
            description={
              <>
                En <span className="font-semibold">“Análisis”</span> verás gráficas que resumen tu actividad:
                frecuencia emocional e intensidad a lo largo del tiempo.
              </>
            }
            screenshot={{
              src: "/manual/06-analisis.png",
              alt: "Captura de la pestaña Análisis con gráficas de tendencias.",
              calloutText: "Análisis",
              caption: "Referencia visual: gráficas de frecuencia e intensidad.",
            }}
          />

          <ManualStep
            title="Comparar sesiones"
            description={
              <>
                Si sientes que se repite un patrón, entra a <span className="font-semibold">“Comparativa”</span>,
                elige dos sesiones y míralas lado a lado para ver tu evolución.
              </>
            }
            screenshot={{
              src: "/manual/07-comparativa.png",
              alt: "Captura de la vista Comparativa mostrando dos sesiones lado a lado.",
              calloutText: "Comparativa",
              caption: "Referencia visual: comparación en paralelo.",
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900/40 dark:text-dark/40 uppercase tracking-tighter">
            4) Preguntas frecuentes
          </h2>

          <div className="space-y-3">
            <details className="group rounded-2xl border border-white/50 bg-white/25 backdrop-blur-md p-4 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-black flex items-center justify-between">
                ¿Puedo borrar una sesión si me arrepiento de lo que escribí?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sí. Abre la sesión desde tu historial y usa el botón <span className="font-semibold">“Eliminar”</span> al final.
              </p>
            </details>

            <details className="group rounded-2xl border border-white/50 bg-white/25 backdrop-blur-md p-4 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-black flex items-center justify-between">
                ¿Qué pasa si mi internet falla a mitad de una reflexión?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ReflectAI guarda temporalmente tu progreso en tu navegador. Si se corta la conexión,
                no cierres la pestaña: tus respuestas se sincronizarán en cuanto vuelva el internet.
              </p>
            </details>

            <details className="group rounded-2xl border border-white/50 bg-white/25 backdrop-blur-md p-4 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-black flex items-center justify-between">
                ¿Puedo eliminar todos mis datos?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sí. Ve a <span className="font-semibold">“Configuración de Cuenta”</span> y elige <span className="font-semibold">“Eliminar Cuenta”</span>.
                Esto borrará tu perfil y tus reflexiones de forma irreversible.
              </p>
            </details>
          </div>
        </section>
      </GlassCard>
    </main>
  );
}

