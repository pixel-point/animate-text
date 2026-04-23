'use client';

import { CheckIcon, CopyIcon } from '@phosphor-icons/react/ssr';

import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import { Button } from '@/components/ui/button';
import { geistMono } from '@/lib/mono-font';

const installCommand = 'npx skills add <owner>/<repo> --skill animate-text';

export default function InstallSkillButton() {
  const { isCopied, handleCopy } = useCopyToClipboard(1600);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="mt-8 h-9 w-full pr-2.5 pl-3 text-sm text-secondary-foreground [&>span]:justify-between"
      aria-label={isCopied ? 'Copied install command' : 'Copy install command'}
      onClick={() => handleCopy(installCommand)}
    >
      <span className={`${geistMono.className} flex-1 text-left text-[0.8125rem]`}>
        {installCommand}
      </span>
      {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </Button>
  );
}
