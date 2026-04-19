import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect the base URL to our dashboard
  redirect('/dashboard');
}
