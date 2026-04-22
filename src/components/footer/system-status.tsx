const STATUS = {
  default: 'All Systems Normal',
  warning: 'Some Systems Are Warning',
  error: 'Some Systems Are Error',
};

function SystemStatus() {
  const status = STATUS.default;

  return (
    <div className="flex items-center gap-x-2">
      <span className="flex size-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
      <p className="text-sm leading-none font-medium tracking-tight text-foreground">{status}</p>
    </div>
  );
}

export default SystemStatus;
