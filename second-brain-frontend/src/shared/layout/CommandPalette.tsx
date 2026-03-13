import * as Dialog from '@radix-ui/react-dialog';
import { GlobalSearch } from '@/shared/layout/GlobalSearch';

export const CommandPalette = ({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) => {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 p-0 overflow-hidden bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl sm:rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] h-[400px]">
          <GlobalSearch />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
