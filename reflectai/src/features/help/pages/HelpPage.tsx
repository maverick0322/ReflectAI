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
            User guide
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-black">
            ReflectAI help
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            This quick visual guide helps you move through the app with confidence.
            Take it step by step and go at your own pace.
          </p>
        </header>

        <section className="space-y-4">
          <div className={noticeClassName}>
            <div className={noticeIconClassName}>
              <WarningIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Important notice</p>
              <p className="text-sm leading-relaxed">
                ReflectAI supports self-awareness and reflection.{' '}
                <span className="font-semibold">It is not a clinical tool</span>{' '}
                and it does not replace professional psychological or psychiatric
                care, diagnosis, or treatment. If you are in crisis, contact
                local mental health services immediately.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>
            1) Set up your account
          </h2>

          <ManualStep
            title="Create your account"
            description={
              <>
                On the main screen, select{' '}
                <span className="font-semibold">Register</span>.
                You can sign up with your email address and password.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Dashboard screen showing register and sign-in access.',
              calloutText: 'Tap here',
              caption: 'Visual reference: register and sign-in entry points.',
            }}
          />

          <ManualStep
            title="Recover access"
            description={
              <>
                If you forget your password, select{' '}
                <span className="font-semibold">Forgot your password?</span>.
                We will email you a secure reset link.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Sign-in screen showing the password recovery option.',
              calloutText: 'Tap here',
              caption: 'Visual reference: password recovery option.',
            }}
          />

          <ManualStep
            title="Keep it private"
            description={
              <>
                Your reflections belong to you. Once you sign in, only you can
                access your history.
              </>
            }
            screenshot={{
              src: '/manual/01-dashboard.png',
              alt: 'Representative dashboard screen.',
              calloutText: 'Tip',
              caption: 'Write freely. No one else can read this.',
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>
            2) Start a reflection session
          </h2>

          <ManualStep
            title="Start a new reflection"
            description={
              <>
                From the dashboard, select{' '}
                <span className="font-semibold">New reflection</span>.
                The system will guide you step by step.
              </>
            }
            screenshot={{
              src: '/manual/02-new-reflection.png',
              alt: 'Dashboard with the New reflection button highlighted.',
              calloutText: 'Tap here',
              caption: 'Visual reference: New reflection button.',
            }}
          />

          <ManualStep
            title="Follow the flow"
            description={
              <>
                Respond at your own pace. Take a pause if you need one. The most
                important thing is staying honest with yourself.
              </>
            }
            screenshot={{
              src: '/manual/03-question-flow.png',
              alt: 'Guided question flow during a reflection session.',
              calloutText: 'Write here',
              caption: 'Visual reference: response field and flow navigation.',
            }}
          />

          <ManualStep
            title="Rate intensity"
            description={
              <>
                Some questions include a{' '}
                <span className="font-semibold">1 to 10</span> scale.
                Move the slider to show how intense the emotion feels right now.
              </>
            }
            screenshot={{
              src: '/manual/04-intensity-slider.png',
              alt: 'Emotion intensity slider control.',
              calloutText: 'Drag here',
              caption: 'Visual reference: intensity slider from 1 to 10.',
            }}
          />

          <ManualStep
            title="Save your session"
            description={
              <>
                When you reach the end, select{' '}
                <span className="font-semibold">Save session</span>.
                Your progress will be stored securely.
              </>
            }
            screenshot={{
              src: '/manual/03-question-flow.png',
              alt: 'Final session step showing the save button.',
              calloutText: 'Save session',
              caption: 'Visual reference: save button at the end of the flow.',
            }}
          />
        </section>

        <section className="space-y-6">
          <h2 className={sectionHeadingClassName}>
            3) Review your progress
          </h2>

          <ManualStep
            title="History"
            description={
              <>
                Open <span className="font-semibold">My sessions</span> to review
                your reflections by date. Select any session to read it again.
              </>
            }
            screenshot={{
              src: '/manual/05-my-sessions.png',
              alt: 'My sessions screen with a reflection list.',
              calloutText: 'My sessions',
              caption: 'Visual reference: sessions ordered by date.',
            }}
          />

          <ManualStep
            title="Trend dashboard"
            description={
              <>
                In <span className="font-semibold">Statistics</span> you can review
                charts that summarize emotional frequency and intensity over time.
              </>
            }
            screenshot={{
              src: '/manual/06-analysis.png',
              alt: 'Statistics tab with trend charts.',
              calloutText: 'Statistics',
              caption: 'Visual reference: frequency and intensity charts.',
            }}
          />

          <ManualStep
            title="Compare sessions"
            description={
              <>
                If you notice a recurring pattern, open the comparison view,
                choose two sessions, and inspect them side by side.
              </>
            }
            screenshot={{
              src: '/manual/07-comparison.png',
              alt: 'Comparison view showing two sessions side by side.',
              calloutText: 'Compare',
              caption: 'Visual reference: side-by-side comparison.',
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className={sectionHeadingClassName}>
            4) Frequently asked questions
          </h2>

          <div className="space-y-3">
            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                Can I delete a session if I regret what I wrote?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Yes. Open the session from your history and use the{' '}
                <span className="font-semibold">Delete</span> button at the bottom.
              </p>
            </details>

            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                What happens if my internet connection drops mid-session?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                ReflectAI stores your progress temporarily in the browser. If the
                connection drops, keep the tab open and your answers will sync
                when the connection returns.
              </p>
            </details>

            <details className={detailsClassName}>
              <summary className={summaryClassName}>
                Can I delete all of my data?
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ^
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Yes. Open <span className="font-semibold">Account settings</span>{' '}
                and choose <span className="font-semibold">Delete account</span>.
                This removes your profile and reflections permanently.
              </p>
            </details>
          </div>
        </section>
      </GlassCard>
    </main>
  );
}
