import Script from 'next/script';
import type { Viewport } from 'next';
import config from '@/configs/website-config';
import { MENUS } from '@/constants/menus';
import { Providers } from '@/contexts';
import { fontVariablesClassName, fontVariablesStyle } from '@/lib/theme-fonts';
import Footer from '@/components/footer';
import Header from '@/components/header';

export const viewport: Viewport = {
  themeColor: config.metaThemeColors.light,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <head>
        <Script id="theme-color-meta-sync" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.querySelector('meta[name="theme-color"]').setAttribute('content', '${config.metaThemeColors.dark}')
              }
            } catch (_) {}
          `}
        </Script>
      </head>

      <body
        className={`flex min-h-svh flex-col bg-background ${fontVariablesClassName} font-sans antialiased`}
        style={fontVariablesStyle}
      >
        <Providers>
          <div
            className="flex grow flex-col rounded-none bg-background aria-hidden:[-webkit-mask-image:-webkit-radial-gradient(white,black)]"
            vaul-drawer-wrapper=""
          >
            <Header menuItems={MENUS.header} />
            <div className="grow">{children}</div>
            <Footer menuItems={MENUS.footer.main} socialItems={MENUS.footer.social} />
          </div>
        </Providers>
      </body>
    </>
  );
}
