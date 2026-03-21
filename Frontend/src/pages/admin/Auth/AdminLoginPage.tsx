import AdminLoginForm from "../../../components1/admin/auth/AdminLoginForm";


const AdminLogin = () => {
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
          className="text-center text-2xl font-bold tracking-[0.15em] text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          LOGIN
        </h1>
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLogin;
