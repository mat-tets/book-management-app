import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";

const useNavigateWithViewTransition = () => {
  const navigate = useNavigate();

  const navigateVT = useCallback(
    (to, options) => {
      if (!document.startViewTransition) {
        navigate(to, options);
        return Promise.resolve();
      }

      const vt = document.startViewTransition(() => {
        flushSync(() => {
          navigate(to, options);
        });
      });

      // 「遷移が終わったら何かしたい」に備えて Promise を返す
      return vt.finished;
    },
    [navigate],
  );

  return navigateVT;
};

export default useNavigateWithViewTransition;
