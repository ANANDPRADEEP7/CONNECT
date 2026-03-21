const Dashboard = () => {
  const stats = [
    { label: "Total Users", value: "1,245" },
    { label: "Active Riders", value: "328" },
    { label: "Pending Approvals", value: "12" },
    { label: "Total Bookings", value: "5,892" },
  ];

  return (
    <div className="space-y-8">
      <h2
        className="text-xl tracking-[0.15em] font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ADMIN DASHBOARD
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-6 space-y-2"
          >
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
