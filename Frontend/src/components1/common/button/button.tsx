interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const Button = ({ icon, label, onClick }: SocialButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-secondary border border-border text-secondary-foreground text-xs tracking-widest uppercase hover:bg-accent transition-colors flex-1"
  >
    {icon}
    {label}
  </button>
);

export default Button;
