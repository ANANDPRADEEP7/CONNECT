import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface SignupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, SignupInputProps>(
  ({ label, error, isPassword, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1">
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={label}
            className="w-full bg-input border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground tracking-widest  placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-destructive text-red-500 text-xs pl-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "SignupInput";
export default Input;
