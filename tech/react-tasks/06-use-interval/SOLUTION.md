# Решение: useInterval без stale closure

```tsx
import { useEffect, useRef, useState } from "react";

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

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
```

Паттерн "актуальный callback в ref": интервал подписан только на `delay`, а свежие `count` и `step` читаются в момент тика из `savedCallback.current`.

## Подробный разбор

**Почему заготовка ломается.**
Эффект зависит только от `delay`, поэтому `setInterval` захватывает первый `callback`. В нём `count` всегда 0, `step` всегда 1. Каждый тик делает `setCount(0 + 1)`, и счётчик застревает на 1. В консоли тоже стартовое значение. Если добавить `callback` в зависимости, замыкание станет свежим, но интервал будет очищаться и ставиться заново на каждом рендере: смена шага или любой другой рендер сбросит секундный ритм.

**Зачем два эффекта.**
Первый только записывает актуальный `callback` в ref. Второй создаёт интервал и зависит лишь от `delay`. Смена колбэка не пересоздаёт таймер, смена задержки или пауза (`delay === null`) пересоздаёт.

## Вопросы для обсуждения

1. Почему нельзя просто положить `callback` в зависимости эффекта с `setInterval`?

   Ответ: колбэк в компоненте обычно создаётся заново на каждом рендере. Эффект увидит новую функцию, снимет старый интервал и поставит новый. Тик начнёт отсчёт заново, таймер будет "плавать". Именно это и просит условие не допустить при смене шага.

2. Как то же самое выглядит в React 19 с `useEffectEvent`?

   Ответ: `useEffectEvent` как раз для функции, которая должна читать свежие props и state, но не быть реактивной зависимостью эффекта. Тогда второй эффект остаётся с `[delay]`, а вместо ref вызывают эту функцию. До React 19 тот же смысл даёт ref вручную.

3. Чем это отличается от `setTimeout` внутри `useEffect`, который зависит от `count`?

   Ответ: там таймер специально пересоздают после каждого тика, потому что следующий запуск должен взять уже новое значение. Для интервала такая схема лишняя: один стабильный `setInterval` должен жить, пока не изменится `delay`, и каждый раз вызывать свежий колбэк.

**На что смотреть:** появился ли ref со свежим колбэком; не попал ли `callback` в зависимости эффекта с интервалом; чистится ли таймер в cleanup и при `delay === null`; не "исправил" ли кандидат только демо через `setCount((c) => c + step)`, оставив хук сломанным (тогда `console.log` по-прежнему врёт).
