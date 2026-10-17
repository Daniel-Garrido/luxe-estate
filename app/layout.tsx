import type { Metadata } from "next";
import "./globals.css";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.meta.siteTitle,
    description: dict.meta.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [dict, user] = await Promise.all([getDictionary(locale), getCurrentUser()]);

  return (
    <html lang={locale} className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-light text-nordic-dark antialiased selection:bg-mosque selection:text-white">
        <I18nProvider locale={locale} dict={dict}>
          <AuthProvider user={user}>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
