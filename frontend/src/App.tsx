import { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import SavedReportView from "./components/SavedReportView";

function reportIdFromHash(): string | null {
  const m = window.location.hash.match(/^#\/r\/([A-Za-z0-9_-]+)$/);
  return m ? m[1] : null;
}

export default function App() {
  const [reportId, setReportId] = useState<string | null>(reportIdFromHash);

  useEffect(() => {
    const onChange = () => setReportId(reportIdFromHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (reportId) {
    return (
      <SavedReportView
        key={reportId}
        id={reportId}
        onHome={() => {
          window.location.hash = "#/";
        }}
      />
    );
  }

  return <Wizard />;
}
