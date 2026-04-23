import { CopyCommand } from '@/components/ui/copy-command';
import { geistMono } from '@/lib/mono-font';
import { cn } from '@/lib/utils';

const installCommand = 'npx skills add <owner>/<repo> --skill animate-text';

export default function InstallSkillButton() {
  return (
    <CopyCommand
      className="mt-8 h-11 w-full border-transparent bg-muted/80 pr-2 pl-4 text-foreground dark:bg-muted/65"
      contentClassName={cn(geistMono.className, 'pr-4')}
      copyAriaLabel="Copy install command"
      copyButtonClassName="size-8 text-muted-foreground hover:text-foreground focus-visible:ring-offset-muted dark:focus-visible:ring-offset-muted lg:size-8"
      command={installCommand}
      commandClassName="text-sm text-foreground"
      fadeClassName="w-16 bg-gradient-to-r from-transparent via-muted/80 to-muted/80 dark:via-muted/65 dark:to-muted/65"
      prefix="$"
      showFade
    />
  );
}
