import { useCallback, useRef } from "react";

export function useComposition() {
  const isComposingRef = useRef(false);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  return {
    isComposing: isComposingRef,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
