import { useCallback, useState } from 'react';
import {
  CalculatorAction,
  calculatorReducer,
  displayOf,
  evaluationOf,
  Evaluation,
  initialState,
} from '../utils/calculator';

export const useCalculator = (onEvaluate: (evaluation: Evaluation) => void) => {
  const [state, setState] = useState(initialState);

  const press = useCallback(
    (action: CalculatorAction) => {
      const next = calculatorReducer(state, action);
      if (next === state) return;
      setState(next);
      const evaluation = action.type === 'equals' ? evaluationOf(next) : null;
      if (evaluation) onEvaluate(evaluation);
    },
    [state, onEvaluate],
  );

  const pendingOperator = state.kind === 'ready' ? state.pending?.operator ?? null : null;

  return { display: displayOf(state), pendingOperator, press };
};
