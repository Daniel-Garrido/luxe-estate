import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/redirect';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.auth.metaTitle,
    description: dict.auth.metaDescription,
  };
}

interface LoginPageProps {
  searchParams: Promise<{
    mode?: string;
    next?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);

  const [dict, user] = await Promise.all([getDictionary(), getCurrentUser()]);

  // Already signed in: nothing to do here
  if (user) {
    redirect(next);
  }

  // Google / GitHub create the account on first sign-in, so sign up only changes the copy
  const isSignup = params.mode === 'signup';
  const toggleHref = `/login?${new URLSearchParams({
    ...(isSignup ? {} : { mode: 'signup' }),
    ...(next !== '/' ? { next } : {}),
  }).toString()}`;

  return (
    <div className="font-display bg-clear-day min-h-screen flex items-center justify-center p-4 antialiased text-nordic relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-hint-green/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-mosque/10 rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 bg-mosque rounded-xl mb-6 shadow-[0_4px_20px_-2px_rgba(25,50,47,0.05)] text-white"
            aria-label="LuxeEstate"
          >
            <span className="material-symbols-rounded text-3xl">real_estate_agent</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-nordic mb-2">
            {isSignup ? dict.auth.signupTitle : dict.auth.loginTitle}
          </h1>
          <p className="text-nordic/60">
            {isSignup ? dict.auth.signupSubtitle : dict.auth.loginSubtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(25,50,47,0.05)] p-8 sm:p-10 border border-white/50 backdrop-blur-sm">
          {params.error && (
            <p role="alert" className="mb-6 text-sm text-center text-red-600 bg-red-50 rounded-lg p-3">
              {dict.auth.error}
            </p>
          )}

          <SocialLoginButtons next={next} />

          <p className="mt-8 text-center text-sm text-nordic/70">
            {isSignup ? dict.auth.haveAccount : dict.auth.noAccount}{' '}
            <Link
              href={toggleHref}
              className="font-semibold text-mosque hover:text-[#004d40] transition-colors"
            >
              {isSignup ? dict.auth.logIn : dict.auth.signUp}
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-nordic/50">
            <a className="hover:text-nordic transition-colors" href="#">
              {dict.auth.privacy}
            </a>
            <a className="hover:text-nordic transition-colors" href="#">
              {dict.auth.terms}
            </a>
            <a className="hover:text-nordic transition-colors" href="#">
              {dict.auth.help}
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}
