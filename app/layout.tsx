import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navigation from "@/components/auth/Navigation";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProbider";
import TrpcProvider from "@/components/providers/TrpcProvider";
import { getAuthSession } from "@/lib/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "T3stack入門",
  description: "T3stack入門",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const user = await getAuthSession();

  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <TrpcProvider>
              <Navigation user={user} />
              <ToastProvider />
              <main className="container mx-auto max-w-screen-md flex-1 px-2">
                {children}
              </main>
              <footer className="py-5">
                <div className="text-center text-sm">
                  Copyright All rights reserved |{" "}
                  <a
                    href=""
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    t3stack-tutorial
                  </a>
                </div>
              </footer>
            </TrpcProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
