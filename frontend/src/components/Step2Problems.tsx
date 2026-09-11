import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  TriangleAlert,
} from "lucide-react";
import { fetchPersonalizedRemedies } from "../api/client";
import {
  PROBLEM_CATEGORIES,
  SUB_PROBLEMS,
  type ProblemCategoryId,
} from "../types";
import { CategoryIcon } from "./icons";

// Build reverse map: sub-problem ID → parent category ID
const SUB_TO_CATEGORY: Record<string, ProblemCategoryId> = {};
for (const cat of PROBLEM_CATEGORIES) {
  for (const sp of SUB_PROBLEMS[cat.id]) {
    SUB_TO_CATEGORY[sp.id] = cat.id;
  }
}
import type { ChartResult, PersonalizedResult } from "../types";

interface Props {
  chartResult: ChartResult;
  onSubmit: (problems: string[], result: PersonalizedResult) => void;
  onBack: () => void;
  initialSelection: string[];
}

export default function Step2Problems({
  chartResult,
  onSubmit,
  onBack,
  initialSelection,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelection),
  );
  const [expandedCategory, setExpandedCategory] = useState<ProblemCategoryId | null>(
    initialSelection.length > 0 ? null : "health",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (catId: ProblemCategoryId, checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const sp of SUB_PROBLEMS[catId]) {
          if (checked) next.add(sp.id);
          else next.delete(sp.id);
        }
        return next;
      });
    },
    [],
  );

  const isAllSelected = useCallback(
    (catId: ProblemCategoryId) =>
      SUB_PROBLEMS[catId].every((sp) => selected.has(sp.id)),
    [selected],
  );

  const isSomeSelected = useCallback(
    (catId: ProblemCategoryId) =>
      SUB_PROBLEMS[catId].some((sp) => selected.has(sp.id)) &&
      !isAllSelected(catId),
    [selected, isAllSelected],
  );

  const handleSubmit = async () => {
    if (selected.size === 0) {
      setError("Please select at least one life problem");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Map sub-problem IDs to their parent category IDs
      const categorySet = new Set<ProblemCategoryId>();
      for (const subId of selected) {
        const catId = SUB_TO_CATEGORY[subId];
        if (catId) categorySet.add(catId);
      }
      const problems = Array.from(categorySet);
      const result = await fetchPersonalizedRemedies(chartResult, problems);
      onSubmit(problems, result);
    } catch (err: any) {
      setError(err.message || "Failed to compute remedies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-form">
      <h2 className="step-title">Select Your Life Problems</h2>
      <p className="step-desc">
        Choose the areas where you need spiritual remedies. We'll match them to
        the relevant grahas in your chart.
      </p>

      {/* Category accordion */}
      <div className="categories">
        {PROBLEM_CATEGORIES.map((cat) => {
          const isOpen = expandedCategory === cat.id;
          const allChecked = isAllSelected(cat.id);
          const someChecked = isSomeSelected(cat.id);

          return (
            <div key={cat.id} className={`category-card ${isOpen ? "open" : ""}`}>
              {/* Category header — acts as dropdown toggle */}
              <button
                type="button"
                className="category-header"
                onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
              >
                <span className="category-icon">
                  <CategoryIcon id={cat.id} size={20} />
                </span>
                <span className="category-label">{cat.label}</span>
                <span className="category-chevron">
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </span>
              </button>

              {/* Expandable content — checkboxes + select-all */}
              {isOpen && (
                <div className="category-body">
                  {/* Select all / none toggle */}
                  <label className="select-all-row">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={(e) => toggleAll(cat.id, e.target.checked)}
                    />
                    <span className="select-all-label">
                      {allChecked ? "Deselect all" : "Select all"}
                    </span>
                  </label>

                  {/* Individual sub-problem checkboxes */}
                  {SUB_PROBLEMS[cat.id].map((sp) => (
                    <label key={sp.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.has(sp.id)}
                        onChange={() => toggle(sp.id)}
                      />
                      <span className="checkbox-label">{sp.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected count */}
      <div className="selected-count">
        {selected.size > 0 ? (
          <span className="sel-badge">
            <Check size={14} /> {selected.size} problem{selected.size !== 1 ? "s" : ""} selected
          </span>
        ) : (
          <span className="muted">No problems selected yet</span>
        )}
      </div>

      {/* Error */}
      {error && <div className="field-error">
          <TriangleAlert size={15} className="fe-ic" /> {error}
        </div>}

      {/* Navigation */}
      <div className="step-nav">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || selected.size === 0}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <span className="spinner" /> Finding Remedies…
            </>
          ) : (
            <>Get Remedies <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}
