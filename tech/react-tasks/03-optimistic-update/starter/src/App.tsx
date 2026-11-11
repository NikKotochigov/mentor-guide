import { useState } from "react";
import { saveLike } from "./api";
import { useOptimisticState } from "./useOptimisticState";

export default function App() {
  const [likes, pending, run] = useOptimisticState(0);
  const [fail, setFail] = useState(true);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={fail}
          onChange={(e) => setFail(e.target.checked)}
        />
        Сервер отвечает ошибкой
      </label>
      <button
        disabled={pending}
        onClick={() => run(likes + 1, () => saveLike(likes + 1, fail))}
      >
        Лайк {likes}
      </button>
    </>
  );
}
