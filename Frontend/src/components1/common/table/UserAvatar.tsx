interface UserAvatarProps {
  name: string;
  /** Optional badge rendered next to the name (e.g. verified tick) */
  badge?: React.ReactNode;
}

const UserAvatar = ({ name, badge }: UserAvatarProps) => (
  <div className="flex items-center gap-4 min-w-[160px]">
    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border-2 border-blue-500/50 shrink-0">
      <span className="text-sm font-semibold text-foreground">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
    <div className="flex items-center gap-1">
      <p className="text-sm font-medium text-foreground">{name}</p>
      {badge}
    </div>
  </div>
);

export default UserAvatar;
