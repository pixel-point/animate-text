import NextLink from 'next/link';
import config from '@/configs/website-config';
import { MENUS } from '@/constants/menus';
import { Providers } from '@/contexts';

import { fontVariablesClassName } from '@/lib/theme-fonts';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';
import Header from '@/components/header';

export default function NotFound() {
  return (
    <>
      <head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Sorry, the page you are looking for does not exist or has been moved."
        />
        <meta name="pathname" content="" />
        <title>{`Page Not Found | ${config.projectName}`}</title>
      </head>
      <body
        className={`flex min-h-svh flex-col bg-background ${fontVariablesClassName} font-sans antialiased`}
      >
        <Providers>
          <Header menuItems={MENUS.header} />
          <main className="flex grow">
            <section className="not-found flex grow items-center justify-center px-5 py-20 md:px-8">
              <div className="flex max-w-md flex-col items-center justify-center md:max-w-lg">
                <h1 className="text-8xl leading-none font-semibold tracking-tighter text-foreground md:text-9xl md:leading-none">
                  <span className="sr-only">Error</span>404
                  <span className="sr-only">: Page Not Found</span>
                </h1>
                <p className="mt-2.5 text-center text-base leading-normal tracking-tight text-foreground md:text-lg md:leading-normal">
                  We know this isn&apos;t where you intended to land, but we hope you have some fun
                  while you&apos;re here.
                </p>
                <Button className="mt-6 xl:mt-8" asChild>
                  <NextLink href="/">Go to homepage</NextLink>
                </Button>
              </div>
            </section>
          </main>
          <Footer menuItems={MENUS.footer.main} socialItems={MENUS.footer.social} />
        </Providers>
      </body>
    </>
  );
}
