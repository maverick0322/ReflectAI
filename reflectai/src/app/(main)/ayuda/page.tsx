import WarningIcon from '@/components/icons/WarningIcon';
import ManualStep from '@/components/manual/ManualStep';
import GlassCard from '@/components/ui/GlassCard';

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
            AquÃ­ encuentras una guÃ­a rÃ¡pida y visual para moverte con confianza.
            Ve paso a paso, sin prisa: esto es para ti.
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
                ReflectAI es una herramienta de apoyo para el autoconocimiento y
                la autorreflexiÃ³n.
                <span className="font-semibold"> No es una herramienta clÃ­nica</span>{' '}
                y no sustituye, bajo ninguna circunstancia, la atenciÃ³n,
                diagnÃ³stico o tratamiento psicolÃ³gico o psiquiÃ¡trico
                profesional. Si estÃ¡s atravesando una crisis, por favor
                contacta a los servicios de salud mental de tu localidad.
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
                En la pantalla principal, selecciona{' '}
                <span className="font-semibold">â€œRegistrarseâ€</span>.
                Puedes usar tu correo y una contraseÃ±a, o entrar con
                Google/Apple para hacerlo mÃ¡s rÃ¡pido.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Captura del panel principal mostrando el acceso a registro e inicio.',
              calloutText: 'Haz clic aquÃ­',
              caption: 'Referencia visual: acceso a registro/inicio.',
            }}
          />

          <ManualStep
            title="Recuperar acceso"
            description={
              <>
                Si olvidas tu contraseÃ±a, haz clic en{' '}
                <span className="font-semibold">â€œÂ¿Olvidaste tu contraseÃ±a?â€</span>.
                Te enviaremos un enlace seguro a tu correo.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Captura de la pantalla de inicio de sesiÃ³n con la opciÃ³n de recuperar contraseÃ±a.',
              calloutText: 'Haz clic aquÃ­',
              caption: 'Referencia visual: opciÃ³n â€œÂ¿Olvidaste tu contraseÃ±a?â€.',
            }}
          />

          <ManualStep
            title="Privacidad total"
            description={
              <>
                Tus reflexiones son solo tuyas. Al iniciar sesiÃ³n, tÃº eres la
                Ãºnica persona que puede acceder a tu historial.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Captura representativa del panel principal.',
              calloutText: 'Tip',
              caption: 'Recuerda: escribe con libertad. Nadie mÃ¡s verÃ¡ esto.',
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900/40 dark:text-dark/40 uppercase tracking-tighter">
            2) Iniciar una sesiÃ³n de reflexiÃ³n
          </h2>

          <ManualStep
            title="Comenzar una nueva reflexiÃ³n"
            description={
              <>
                Desde tu panel, haz clic en{' '}
                <span className="font-semibold">â€œNueva ReflexiÃ³nâ€</span>.
                A partir de ahÃ­, el sistema te guÃ­a con preguntas paso a paso.
              </>
            }
            screenshot={{
              src: '/manual/02-nueva-reflexion.png',
              alt: 'Captura del panel mostrando el botÃ³n de Nueva ReflexiÃ³n.',
              calloutText: 'Haz clic aquÃ­',
              caption: 'Referencia visual: botÃ³n â€œNueva ReflexiÃ³nâ€.',
            }}
          />

          <ManualStep
            title="Seguir el flujo"
            description={
              <>
                Responde a tu ritmo. Si lo necesitas, toma una pausa. Lo
                importante es que seas honesto contigo.
              </>
            }
            screenshot={{
              src: '/manual/03-flujo-preguntas.png',
              alt: 'Captura del flujo de preguntas guiadas durante una sesiÃ³n.',
              calloutText: 'Escribe aquÃ­',
              caption: 'Referencia visual: campo de respuesta y navegaciÃ³n del flujo.',
            }}
          />

          <ManualStep
            title="Medir tu intensidad"
            description={
              <>
                En algunas preguntas, verÃ¡s un control del{' '}
                <span className="font-semibold">1 al 10</span>. Mueve el
                deslizador para indicar cÃ³mo te sientes en ese momento exacto.
              </>
            }
            screenshot={{
              src: '/manual/04-slider-intensidad.png',
              alt: 'Captura del control deslizante de intensidad emocional.',
              calloutText: 'Arrastra aquÃ­',
              caption: 'Referencia visual: slider de intensidad 1â€“10.',
            }}
          />

          <ManualStep
            title="Guardar tu sesiÃ³n"
            description={
              <>
                Cuando llegues al final, haz clic en{' '}
                <span className="font-semibold">â€œGuardar sesiÃ³nâ€</span>. Tu
                progreso se almacena de forma segura.
              </>
            }
            screenshot={{
              src: '/manual/03-flujo-preguntas.png',
              alt: 'Captura final de una sesiÃ³n mostrando el botÃ³n para guardar.',
              calloutText: 'Guardar sesiÃ³n',
              caption: 'Referencia visual: botÃ³n de guardado al final del flujo.',
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
                Ve a <span className="font-semibold">â€œMis Sesionesâ€</span>{' '}
                para ver tu lista de reflexiones por fecha. Toca una para volver
                a leerla.
              </>
            }
            screenshot={{
              src: '/manual/05-mis-sesiones.png',
              alt: 'Captura de la secciÃ³n Mis Sesiones con una lista de reflexiones.',
              calloutText: 'Mis Sesiones',
              caption: 'Referencia visual: lista de sesiones ordenadas por fecha.',
            }}
          />

          <ManualStep
            title="Dashboard de tendencias"
            description={
              <>
                En <span className="font-semibold">â€œAnÃ¡lisisâ€</span>{' '}
                verÃ¡s grÃ¡ficas que resumen tu actividad: frecuencia emocional e
                intensidad a lo largo del tiempo.
              </>
            }
            screenshot={{
              src: '/manual/06-analisis.png',
              alt: 'Captura de la pestaÃ±a AnÃ¡lisis con grÃ¡ficas de tendencias.',
              calloutText: 'AnÃ¡lisis',
              caption: 'Referencia visual: grÃ¡ficas de frecuencia e intensidad.',
            }}
          />

          <ManualStep
            title="Comparar sesiones"
            description={
              <>
                Si sientes que se repite un patrÃ³n, entra a{' '}
                <span className="font-semibold">â€œComparativaâ€</span>, elige
                dos sesiones y mÃ­ralas lado a lado para ver tu evoluciÃ³n.
              </>
            }
            screenshot={{
              src: '/manual/07-comparativa.png',
              alt: 'Captura de la vista Comparativa mostrando dos sesiones lado a lado.',
              calloutText: 'Comparativa',
              caption: 'Referencia visual: comparaciÃ³n en paralelo.',
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
                Â¿Puedo borrar una sesiÃ³n si me arrepiento de lo que escribÃ­?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">âŒ„</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                SÃ­. Abre la sesiÃ³n desde tu historial y usa el botÃ³n{' '}
                <span className="font-semibold">â€œEliminarâ€</span> al final.
              </p>
            </details>

            <details className="group rounded-2xl border border-white/50 bg-white/25 backdrop-blur-md p-4 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-black flex items-center justify-between">
                Â¿QuÃ© pasa si mi internet falla a mitad de una reflexiÃ³n?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">âŒ„</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ReflectAI guarda temporalmente tu progreso en tu navegador. Si se
                corta la conexiÃ³n, no cierres la pestaÃ±a: tus respuestas se
                sincronizarÃ¡n en cuanto vuelva el internet.
              </p>
            </details>

            <details className="group rounded-2xl border border-white/50 bg-white/25 backdrop-blur-md p-4 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-black flex items-center justify-between">
                Â¿Puedo eliminar todos mis datos?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">âŒ„</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                SÃ­. Ve a{' '}
                <span className="font-semibold">â€œConfiguraciÃ³n de Cuentaâ€</span>{' '}
                y elige <span className="font-semibold">â€œEliminar Cuentaâ€</span>.
                Esto borrarÃ¡ tu perfil y tus reflexiones de forma irreversible.
              </p>
            </details>
          </div>
        </section>
      </GlassCard>
    </main>
  );
}
