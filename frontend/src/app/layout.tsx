import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthWrapper from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "Switch Command Center | Job Prep Dashboard",
  description: "Track DSA progress, development learning, job applications, interview prep, and productivity metrics toward a ₹12-15 LPA switch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#080b11]">
        <AuthWrapper>
          <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar navigation */}
            <Sidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen">
              <div className="max-w-7xl mx-auto p-4 md:p-8">
                {children}
              </div>
            </main>
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
