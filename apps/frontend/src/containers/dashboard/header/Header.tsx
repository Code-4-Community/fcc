import { useAuth } from '../../../components/AuthProvider';

type HeaderProps = {
  title?: string;
  userName?: string;
  userRole?: string;
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Header({
  title = 'Dashboard Overview',
  userName = 'F. N. Way',
  userRole = 'Admin/Standard',
  className,
}: HeaderProps) {
  const { user } = useAuth();

  const fullName = [user?.firstName, user?.lastName]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .trim();

  const displayUserName =
    user?.displayName ||
    fullName ||
    user?.username ||
    user?.email ||
    user?.idUser ||
    userName;

  const displayUserRole = user?.status
    ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
    : userRole;

  return (
    <header
      className={cn(
        'flex h-[88px] w-full items-center justify-between border-b border-neutral-200 bg-neutral-50 px-[28px] pr-[34px]',
        className,
      )}
    >
      <h1 className="font-['Source_Sans_Pro'] text-[36px] font-semibold leading-[48px] tracking-[-0.72px] text-black">
        {title}
      </h1>

      <div className="flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-[7.5px]">
        <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-700" />

        <div className="ml-3 flex flex-col">
          <span className="font-['Source_Sans_Pro'] text-[16px] font-semibold leading-7 text-neutral-900">
            {displayUserName}
          </span>
          <span className="font-['Source_Sans_Pro'] text-[14px] font-normal leading-6 text-neutral-900">
            {displayUserRole}
          </span>
        </div>
      </div>
    </header>
  );
}
