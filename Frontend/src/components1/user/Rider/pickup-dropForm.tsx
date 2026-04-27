import PostRideForm from "../../../pages/user/Ride/pickup-drop";
import Navbar from "../../common/Navbar/Navbar";

const PostRide = () => {
  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      <Navbar />
      {/* Wave background SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-20 right-0 w-[70%] h-[80%] opacity-20" viewBox="0 0 800 400" fill="none">
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M0 ${200 + i * 8} Q200 ${150 + i * 12 + Math.sin(i) * 30} 400 ${200 + i * 6} T800 ${180 + i * 10}`}
              stroke="hsl(var(--foreground))"
              strokeWidth="0.5"
              strokeOpacity={0.3 - i * 0.02}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 pt-32 px-6 pb-20 min-h-screen flex items-center justify-center">
        <div className="max-w-[1400px] mx-auto w-full">
          <PostRideForm />
        </div>
      </div>
    </div>
  );
};

export default PostRide;
