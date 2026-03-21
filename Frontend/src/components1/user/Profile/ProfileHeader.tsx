
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string;
  verified?: boolean;
}
const ProfileHeader = ({ name, avatarUrl, verified }: ProfileHeaderProps) => (
  <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
    <div className="relative">
      <div className="rounded-full p-[2px] bg-gradient-to-br from-blue-500 to-cyan-400">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-secondary text-foreground text-lg">
            {name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
    <div className="flex-1">
      <h2 className="text-foreground font-semibold text-lg tracking-wide flex items-center gap-2">
        {name}
        {verified && (
          <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-[10px] text-primary-foreground flex items-center justify-center">✓</span>
        )}
      </h2>
    </div>
    <ChevronRight className="text-muted-foreground" size={24} />
  </div>
);
export default ProfileHeader;
