import Link from 'next/link';
import { Button } from '@local-fashion/ui';

export default function HomePage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold">LocalFashion Retailer Portal</h1>
      <p className="mt-3 text-stone-600">Manage products, offers, and track customer interest.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Sign up</Button>
        </Link>
      </div>
    </div>
  );
}
