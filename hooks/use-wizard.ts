"use client";
import { useReducer, useCallback } from "react";
import type { CVData, WizardStep, ChatMessage } from "@/lib/types/cv";
import { EMPTY_CV_DATA } from "@/lib/types/cv";

// ─── State ─────────────────────────────────────────────────────────────────

interface WizardState {
  sessionId: string;
  currentStep: WizardStep;
  cvData: CVData;
  jobDescription: string;
  chatHistories: Record<number, ChatMessage[]>;
  isLoading: boolean;
  isSaving: boolean;
}

// ─── Actions ───────────────────────────────────────────────────────────────

type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "UPDATE_CV_DATA"; data: Partial<CVData> }
  | { type: "UPDATE_PERSONAL"; data: Partial<CVData["personal"]> }
  | { type: "SET_JOB_DESCRIPTION"; text: string }
  | { type: "ADD_CHAT_MESSAGE"; step: number; message: ChatMessage }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_SAVING"; saving: boolean };

// ─── Reducer ───────────────────────────────────────────────────────────────

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(14, state.currentStep + 1) as WizardStep,
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1) as WizardStep,
      };
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "UPDATE_CV_DATA":
      return { ...state, cvData: { ...state.cvData, ...action.data } };
    case "UPDATE_PERSONAL":
      return {
        ...state,
        cvData: {
          ...state.cvData,
          personal: { ...state.cvData.personal, ...action.data },
        },
      };
    case "SET_JOB_DESCRIPTION":
      return { ...state, jobDescription: action.text };
    case "ADD_CHAT_MESSAGE": {
      const prev = state.chatHistories[action.step] ?? [];
      return {
        ...state,
        chatHistories: {
          ...state.chatHistories,
          [action.step]: [...prev, action.message],
        },
      };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_SAVING":
      return { ...state, isSaving: action.saving };
    default:
      return state;
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useWizard(sessionId: string) {
  const [state, dispatch] = useReducer(wizardReducer, {
    sessionId,
    currentStep: 1,
    cvData: EMPTY_CV_DATA,
    jobDescription: "",
    chatHistories: {},
    isLoading: false,
    isSaving: false,
  });

  const next = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const back = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const setStep = useCallback(
    (step: WizardStep) => dispatch({ type: "SET_STEP", step }),
    []
  );

  const updateCVData = useCallback(
    (data: Partial<CVData>) => dispatch({ type: "UPDATE_CV_DATA", data }),
    []
  );

  const updatePersonal = useCallback(
    (data: Partial<CVData["personal"]>) =>
      dispatch({ type: "UPDATE_PERSONAL", data }),
    []
  );

  const setJobDescription = useCallback(
    (text: string) => dispatch({ type: "SET_JOB_DESCRIPTION", text }),
    []
  );

  const addChatMessage = useCallback(
    (step: number, message: ChatMessage) =>
      dispatch({ type: "ADD_CHAT_MESSAGE", step, message }),
    []
  );

  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: "SET_LOADING", loading }),
    []
  );

  const getChatHistory = useCallback(
    (step: number): ChatMessage[] => state.chatHistories[step] ?? [],
    [state.chatHistories]
  );

  return {
    ...state,
    next,
    back,
    setStep,
    updateCVData,
    updatePersonal,
    setJobDescription,
    addChatMessage,
    setLoading,
    getChatHistory,
  };
}
