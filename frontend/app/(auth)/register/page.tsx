'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Mail } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-background-card rounded-lg p-8 shadow-lg border border-secondary/30">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Caava Group Logo" 
              className="w-48 h-48 object-contain mb-3"
            />
            <div className="text-center mb-4">
              <h1 className="text-5xl font-bold mb-2">
                <span className="text-primary">Caava</span>{' '}
                <span className="text-secondary">Group</span>
              </h1>
              <p className="text-xl text-text-muted">Caava Knowledge Center</p>
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus size={32} className="text-primary" />
            </div>
            <h2 className="text-3xl font-semibold text-text-primary mb-2">Account Creation</h2>
            <p className="text-lg text-text-muted text-center">User accounts are managed by administrators</p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Need an Account?</h3>
                <p className="text-text-muted text-sm mb-3">
                  User accounts for Caava Knowledge Center are created by system administrators. 
                  If you're a new employee and need access, please contact your department manager or HR.
                </p>
                <p className="text-text-muted text-sm">
                  Once your account is created, you'll receive login credentials via email.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Sign In
            </Link>
            <Link
              href="/"
              className="w-full px-6 py-3 bg-background border border-secondary/30 text-text-primary rounded-lg hover:bg-secondary/10 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
