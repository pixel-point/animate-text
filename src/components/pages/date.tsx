import { cn, getFormattedDate } from '@/lib/utils';

interface IDateProps {
  className?: string;
  publishedAt: string;
}

function Date({ className, publishedAt }: IDateProps) {
  return (
    <time
      className={cn(
        'flex text-[0.8125rem] leading-none font-semibold tracking-tight whitespace-nowrap text-muted-foreground uppercase',
        className,
      )}
      dateTime={publishedAt}
    >
      {getFormattedDate(publishedAt)}
    </time>
  );
}

export default Date;
