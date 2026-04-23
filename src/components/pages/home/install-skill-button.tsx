import { CopyCommand } from '@/components/ui/copy-command';
import { geistMono } from '@/lib/mono-font';
import { cn } from '@/lib/utils';

const installCommand = 'npx skills add pixel-point/animate-text --skill animate-text';

export default function InstallSkillButton() {
  return (
    <CopyCommand
      className="mt-11 h-[52px] w-full gap-1 !rounded-2xl border-foreground/4 bg-foreground/8 pr-1 pl-3 text-foreground lg:h-[52px]"
      contentClassName={cn(geistMono.className, 'pr-4')}
      copyAriaLabel="Copy install command"
      copyTitle="Copy"
      copyButtonClassName="size-8 text-foreground/50 transition-[color,transform,opacity] duration-200 ease-out hover:text-foreground focus-visible:ring-offset-muted dark:focus-visible:ring-offset-muted lg:size-8"
      copyIconClassName="size-[20px]"
      copyIconWeight="light"
      command={installCommand}
      commandClassName="text-base font-normal tracking-tighter text-foreground"
      fadeClassName="[-webkit-mask-image:linear-gradient(to_right,black_0,black_calc(100%-4rem),transparent_100%)] [mask-image:linear-gradient(to_right,black_0,black_calc(100%-4rem),transparent_100%)]"
      prefix="$"
      showFade
    />
  );
}
