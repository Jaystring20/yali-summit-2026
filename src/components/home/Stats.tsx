const stats = [
  { number: "700+", label: "Delegates expected" },
  { number: "7", label: "Sector rooms shaping policy" },
  { number: "4 days", label: "Keynotes, workshops, a hackathon" },
  { number: "36 + FCT", label: "States in the room" },
];

export function Stats() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl shadow-md p-6 border text-center sm:text-left"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-strong)",
            }}
          >
            <div
              className="font-bold leading-none"
              style={{
                color: "var(--accent-cyan)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "48px",
              }}
            >
              {s.number}
            </div>
            <div
              className="mt-3 text-sm"
              style={{ color: "var(--text-secondary)", fontSize: "14px" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}