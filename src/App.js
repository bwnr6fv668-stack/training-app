import { useState, useEffect } from "react";

const WORKOUT_DAYS = {
  "Day 1 – Upper Push": ["Incline DB Bench", "Landmine Press", "Lateral Raise"],
  "Day 2 – Lower Body": ["RDL", "Reverse Lunge", "Hip Thrust"],
  "Day 3 – Cardio": ["Incline Walk"],
  "Day 4 – Upper Pull": ["Row", "Pulldown", "Face Pull"],
  "Day 5 – Full Body": ["Deadlift", "Front Squat", "Push Press"],
};

export default function App() {
  const [view, setView] = useState("workout");
  const [day, setDay] = useState("Day 1 – Upper Push");

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("logs");
    return saved ? JSON.parse(saved) : {};
  });

  const [current, setCurrent] = useState({
    weight: 100,
    reps: 8,
    rpe: 8,
  });

  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  // ✅ Adjust controls
  const adjust = (field, amount) => {
    setCurrent((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + amount),
    }));
  };

  // ✅ Log a set
  const logSet = (exercise) => {
    const entry = {
      ...current,
      score: current.weight * current.reps,
    };

    setLogs((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [exercise]: [...(prev[day]?.[exercise] || []), entry],
      },
    }));
  };

  // ✅ Delete set
  const deleteSet = (exercise, index) => {
    if (!window.confirm("Delete this set?")) return;

    setLogs((prev) => {
      const updated = [...(prev[day]?.[exercise] || [])];
      updated.splice(index, 1);

      return {
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [exercise]: updated,
        },
      };
    });
  };

  // ✅ Edit set
  const editSet = (exercise, index) => {
    const set = logs[day][exercise][index];

    const weight = prompt("Weight:", set.weight);
    const reps = prompt("Reps:", set.reps);
    const rpe = prompt("RPE:", set.rpe);

    if (!weight || !reps) return;

    const updated = {
      weight: Number(weight),
      reps: Number(reps),
      rpe: Number(rpe),
      score: Number(weight) * Number(reps),
    };

    setLogs((prev) => {
      const newSets = [...prev[day][exercise]];
      newSets[index] = updated;

      return {
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [exercise]: newSets,
        },
      };
    });
  };

  // ✅ Best set calculation
  const getBestSet = (exercise) => {
    const sets = logs[day]?.[exercise] || [];
    if (!sets.length) return null;
    return sets.reduce((best, s) => (s.score > best.score ? s : best));
  };

  // ✅ NEW: Last set tracking
  const getLastSet = (exercise) => {
    const sets = logs[day]?.[exercise] || [];
    if (!sets.length) return null;
    return sets[sets.length - 1];
  };

  // ✅ Strength audit
  const buildAudit = () => {
    const audit = [];

    Object.keys(WORKOUT_DAYS).forEach((d) => {
      WORKOUT_DAYS[d].forEach((ex) => {
        const sets = logs[d]?.[ex] || [];
        if (sets.length > 0) {
          const best = sets.reduce((a, b) => (a.score > b.score ? a : b));
          audit.push({ exercise: ex, day: d, best });
        }
      });
    });

    return audit;
  };

  return (
    <div
      style={{
        padding: 12,
        maxWidth: 500,
        margin: "auto",
        fontFamily: "Arial",
      }}
    >
      <h2>Training App</h2>

      {/* NAV */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setView("workout")}>Workout</button>
        <button onClick={() => setView("audit")}>Audit</button>
      </div>

      {/* WORKOUT VIEW */}
      {view === "workout" && (
        <>
          {/* DAYS */}
          <div style={{ marginBottom: 10 }}>
            {Object.keys(WORKOUT_DAYS).map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                style={{
                  margin: 3,
                  padding: "6px 8px",
                  background: d === day ? "#333" : "#ccc",
                  color: d === day ? "#fff" : "#000",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* EXERCISES */}
          {WORKOUT_DAYS[day].map((ex) => (
            <div
              key={ex}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
              }}
            >
              <strong>{ex}</strong>

              {/* ✅ LAST SET */}
              {getLastSet(ex) && (
                <div style={{ fontSize: 12, color: "#777" }}>
                  Last: {getLastSet(ex).weight} x {getLastSet(ex).reps} (RPE{" "}
                  {getLastSet(ex).rpe})
                </div>
              )}

              {/* CONTROLS */}
              <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                <div>
                  W: {current.weight}
                  <br />
                  <button onClick={() => adjust("weight", 5)}>+5</button>
                  <button onClick={() => adjust("weight", -5)}>-5</button>
                </div>

                <div>
                  R: {current.reps}
                  <br />
                  <button onClick={() => adjust("reps", 1)}>+1</button>
                  <button onClick={() => adjust("reps", -1)}>-1</button>
                </div>

                <div>
                  RPE:
                  <br />
                  {[6, 7, 8, 9].map((r) => (
                    <button
                      key={r}
                      onClick={() => setCurrent({ ...current, rpe: r })}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button style={{ marginTop: 6 }} onClick={() => logSet(ex)}>
                ✅ Log
              </button>

              {/* SETS */}
              {(logs[day]?.[ex] || []).map((s, i) => (
                <div key={i} style={{ fontSize: 12 }}>
                  {s.weight} x {s.reps} (RPE {s.rpe}) → {s.score}
                  <button onClick={() => editSet(ex, i)}>✏️</button>
                  <button onClick={() => deleteSet(ex, i)}>🗑️</button>
                </div>
              ))}

              {/* BEST */}
              {getBestSet(ex) && (
                <div style={{ fontSize: 12, color: "green" }}>
                  Best: {getBestSet(ex).weight} x {getBestSet(ex).reps}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* AUDIT */}
      {view === "audit" && (
        <div>
          <h3>Strength Audit</h3>
          {buildAudit().map((item, i) => (
            <div key={i}>
              <strong>{item.exercise}</strong> ({item.day})<br />
              {item.best.weight} x {item.best.reps} → {item.best.score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

