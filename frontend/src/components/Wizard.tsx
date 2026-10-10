"use client";

import { useState, useCallback } from "react";
import { Check, Orbit, TriangleAlert, X } from "lucide-react";
import Step1BirthDetails from "./Step1BirthDetails";
import Step2Problems from "./Step2Problems";
import Step3Results from "./Step3Results";
import type { BirthInput, ChartResult, PersonalizedResult, UniversalRemedies } from "../types";
import { fetchUniversalRemedies } from "../api/client";
import { trackEvent } from "../lib/analytics";

export type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  birthInput: BirthInput | null;
  chartResult: ChartResult | null;
  selectedProblems: string[];
  personalizedResult: PersonalizedResult | null;
  universalRemedies: UniversalRemedies | null;
  loading: boolean;
  error: string | null;
}

const STEPS = [
  { num: 1, label: "Birth Details" },
  { num: 2, label: "Life Problems" },
  { num: 3, label: "Remedies" },
];

export default function Wizard() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    birthInput: null,
    chartResult: null,
    selectedProblems: [],
    personalizedResult: null,
    universalRemedies: null,
    loading: false,
    error: null,
  });

  const goTo = useCallback((step: WizardStep) => {
    trackEvent("step_view", { step });
    setState((s) => ({ ...s, step, error: null }));
  }, []);

  const handleBirthSubmit = useCallback((input: BirthInput, result: ChartResult) => {
    trackEvent("chart_computed", {
      place: result.geo.placeName,
      currentCity: result.currentCity ?? null,
    });
    setState((s) => ({
      ...s,
      birthInput: input,
      chartResult: result,
      step: 2,
      error: null,
    }));
  }, []);

  const handleProblemsSubmit = useCallback(
    async (problems: string[], result: PersonalizedResult) => {
      // Fetch universal remedies (non-blocking, show personalized first)
      let universal: UniversalRemedies | null = null;
      try {
        universal = await fetchUniversalRemedies();
      } catch {
        // Universal remedies are optional — continue without them
      }
      trackEvent("remedies_viewed", { problems: problems.length, categories: result.categories.length });
      setState((s) => ({
        ...s,
        selectedProblems: problems,
        personalizedResult: result,
        universalRemedies: universal,
        step: 3,
        error: null,
      }));
    },
    [],
  );

  const handleRestart = useCallback(() => {
    setState({
      step: 1,
      birthInput: null,
      chartResult: null,
      selectedProblems: [],
      personalizedResult: null,
      universalRemedies: null,
      loading: false,
      error: null,
    });
  }, []);

  return (
    <div className="wizard">
      {/* Header */}
      <div className="wizard-header">
        <div className="wizard-logo"><Orbit size={44} strokeWidth={1.4} /></div>
        <h1 className="wizard-title">Graha Remedy</h1>
        <p className="wizard-subtitle">Vedic spiritual remedies for life's challenges</p>
      </div>

      {/* Step indicator */}
      <nav className="wizard-steps">
        {STEPS.map((s, i) => (
          <div key={s.num} className="wizard-step-item">
            <div
              className={`wizard-step-dot ${
                state.step === s.num
                  ? "active"
                  : state.step > s.num
                    ? "done"
                    : ""
              }`}
            >
              {state.step > s.num ? <Check size={15} strokeWidth={2.6} /> : s.num}
            </div>
            <span className="wizard-step-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="wizard-step-line" />}
          </div>
        ))}
      </nav>

      {/* Error banner */}
      {state.error && (
        <div className="wizard-error">
          <span>
            <TriangleAlert size={15} className="fe-ic" /> {state.error}
          </span>
          <button onClick={() => setState((s) => ({ ...s, error: null }))}><X size={15} /></button>
        </div>
      )}

      {/* Step content */}
      <div className="wizard-content">
        {state.step === 1 && (
          <Step1BirthDetails
            onSubmit={handleBirthSubmit}
            initial={state.birthInput}
          />
        )}
        {state.step === 2 && state.chartResult && (
          <Step2Problems
            chartResult={state.chartResult}
            onSubmit={handleProblemsSubmit}
            onBack={() => goTo(1)}
            initialSelection={state.selectedProblems}
          />
        )}
        {state.step === 3 && state.personalizedResult && (
          <Step3Results
            chartResult={state.chartResult!}
            personalizedResult={state.personalizedResult}
            universalRemedies={state.universalRemedies}
            onBack={() => goTo(2)}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
