import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { ImageResponse } from 'next/og';
import config from '@/configs/website-config';

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const SOCIAL_IMAGE_CONTENT_TYPE = 'image/png';

type ThemeMode = 'light' | 'dark' | 'both';

type CreateSocialImageOptions = {
  title?: string;
  size?: {
    width: number;
    height: number;
  };
};

type HomePageData = {
  metadata?: {
    title?: string;
  };
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function readTextFile(relativePath: string): Promise<string | null> {
  try {
    return await readFile(join(process.cwd(), relativePath), 'utf-8');
  } catch {
    return null;
  }
}

async function readJsonFile<T>(relativePath: string): Promise<T | null> {
  const content = await readTextFile(relativePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function getCssBlock(cssText: string, selector: string): string | null {
  const blockMatch = cssText.match(
    new RegExp(`${escapeRegExp(selector)}\\s*\\{([\\s\\S]*?)\\}`, 'm'),
  );
  return blockMatch?.[1] ?? null;
}

function getCssVariable(cssBlock: string | null, variableName: string): string | null {
  if (!cssBlock) return null;

  const tokenMatch = cssBlock.match(
    new RegExp(`${escapeRegExp(variableName)}\\s*:\\s*([^;]+);?`, 'i'),
  );
  return tokenMatch?.[1]?.trim() ?? null;
}

function normalizeCssColor(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized.length) return null;
  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\()/i.test(normalized)) {
    return normalized;
  }

  return `hsl(${normalized})`;
}

async function resolveThemeMode(): Promise<ThemeMode> {
  const [rootLogoDark, rootLogoLight] = await Promise.all([
    readPublicAssetAsDataUrl('/logo-dark.svg'),
    readPublicAssetAsDataUrl('/logo-light.svg'),
  ]);

  if (rootLogoDark && rootLogoLight) {
    return 'both';
  }

  if (config.logo.light && config.logo.dark && config.logo.light !== config.logo.dark) {
    return 'both';
  }

  const [rootLayout, websiteLayout] = await Promise.all([
    readTextFile('src/app/layout.tsx'),
    readTextFile('src/app/(website)/layout.tsx'),
  ]);

  const layoutSource = `${rootLayout ?? ''}\n${websiteLayout ?? ''}`;
  if (/className\s*=\s*["'`][^"'`]*\bdark\b/.test(layoutSource)) {
    return 'dark';
  }

  return 'light';
}

async function resolveThemeColors(
  mode: ThemeMode,
): Promise<{ background: string; foreground: string }> {
  const globalsCss = await readTextFile('src/styles/globals.css');
  const selector = mode === 'dark' ? '.dark' : ':root';
  const cssBlock = globalsCss ? getCssBlock(globalsCss, selector) : null;
  const background =
    normalizeCssColor(getCssVariable(cssBlock, '--background')) ??
    (mode === 'dark' ? config.metaThemeColors.dark : config.metaThemeColors.light);
  const foreground =
    normalizeCssColor(getCssVariable(cssBlock, '--foreground')) ??
    (mode === 'dark' ? '#fafafa' : '#09090b');

  return { background, foreground };
}

function resolveLogoCandidates(mode: ThemeMode): string[] {
  const preferredLogos =
    mode === 'dark'
      ? ['/logo-light.svg', '/logo-dark.svg', config.logo.dark, config.logo.light, '/logo.svg']
      : ['/logo-dark.svg', '/logo-light.svg', config.logo.light, config.logo.dark, '/logo.svg'];

  return Array.from(new Set(preferredLogos.filter((value): value is string => Boolean(value))));
}

function resolveContentType(assetPath: string): string {
  switch (extname(assetPath).toLowerCase()) {
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function readPublicAssetAsDataUrl(assetPath: string): Promise<string | null> {
  const relativePath = assetPath.replace(/^\/+/, '');

  try {
    const buffer = await readFile(join(process.cwd(), 'public', relativePath));
    return `data:${resolveContentType(assetPath)};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

async function resolveLogoDataUrl(mode: ThemeMode): Promise<string | null> {
  for (const candidate of resolveLogoCandidates(mode)) {
    const dataUrl = await readPublicAssetAsDataUrl(candidate);
    if (dataUrl) {
      return dataUrl;
    }
  }

  return null;
}

function getFallbackBrandText(): string {
  const trimmedName = config.projectName.trim();
  return trimmedName.length ? trimmedName.slice(0, 1).toUpperCase() : 'P';
}

export async function resolveHomeSocialTitle(): Promise<string> {
  const homeData = await readJsonFile<HomePageData>('src/components/pages/home/data.json');
  const title = homeData?.metadata?.title;

  return typeof title === 'string' && title.trim().length > 0 ? title.trim() : 'Home';
}

export async function createSocialImageResponse({
  title,
  size = SOCIAL_IMAGE_SIZE,
}: CreateSocialImageOptions): Promise<ImageResponse> {
  const mode = await resolveThemeMode();
  const { background, foreground } = await resolveThemeColors(mode);
  const logoDataUrl = await resolveLogoDataUrl(mode);
  const resolvedTitle = title?.trim() || config.projectName;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px',
        background,
        color: foreground,
      }}
    >
      {logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoDataUrl}
          alt={config.logoAlt || config.projectName}
          height={40}
          style={{
            objectFit: 'contain',
            objectPosition: 'left center',
            width: 'auto',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '24px',
            border: `2px solid ${foreground}`,
            padding: '18px 24px',
            fontSize: '36px',
            fontWeight: 700,
          }}
        >
          {getFallbackBrandText()}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          maxWidth: '92%',
          fontSize: '78px',
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: '-0.06em',
        }}
      >
        {resolvedTitle}
      </div>
    </div>,
    {
      width: size.width,
      height: size.height,
    },
  );
}
