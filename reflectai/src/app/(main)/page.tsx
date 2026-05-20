import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/core/routing/routes';

export default function Home() {
  redirect(APP_ROUTES.register);
}
