/*
  useInterval без stale closure (30-40 минут)

  Нужен хук useInterval(callback, delay) для таймера. Ниже уже есть
  заготовка хука и демо: счётчик, пауза и шаг. Заготовка работает
  с ошибками.

  Что сделать:
  - каждые delay мс вызывай callback;
  - delay === null останавливает интервал;
  - при смене delay интервал пересоздаётся;
  - при смене callback интервал не должен сбрасываться
    (иначе тик сбивается на каждом рендере);
  - подписка снимается при unmount.

  Демо менять не нужно: оно специально читает count и step из
  замыкания, чтобы был виден stale closure.

  Как проверить:
  - счётчик растёт каждую секунду: 1, 2, 3, а не застревает на 1;
  - пауза останавливает таймер, "Продолжить" идёт дальше
    с того же числа;
  - переключение шага на 10: следующий тик прибавляет 10,
    секундный ритм не перезапускается с нуля;
  - в консоли каждое tick совпадает с числом на экране.
*/

import { useEffect, useState } from "react";

function useInterval(callback: () => void, delay: number | null): void {
  // TODO: исправь баги
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function App() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);
  const [step, setStep] = useState(1);

  useInterval(() => {
    console.log("tick", count);
    setCount(count + step);
  }, running ? 1000 : null);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <p style={{ fontSize: 32, margin: "0 0 12px" }}>{count}</p>
      <button
        onClick={() => setRunning((r) => !r)}
        style={{ marginRight: 8 }}
      >
        {running ? "Пауза" : "Продолжить"}
      </button>
      <button onClick={() => setStep((s) => (s === 1 ? 10 : 1))}>
        Шаг: {step}
      </button>
    </div>
  );
}

export default App;
