import ForgotPasswordForm from "../../../components1/user/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        // backgroundImage: `url(${marbleBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border/50">
        <h1
          className="text-center text-2xl font-bold tracking-[0.15em] text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          co<span className="inline-block border border-foreground rounded px-1 mx-0.5 text-lg align-middle">n</span>nect
        </h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;
