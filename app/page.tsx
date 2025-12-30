import LoginForm from '@/components/Auth/LoginForm';
import ThemeToggle from '@/components/ui/ThemeToggle';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
