import { useState } from "react";
import type { Contact } from "./data";

export function Chat({ contact }: { contact: Contact }) {
  const [draft, setDraft] = useState("");

  // TODO: поле теряет фокус после каждого символа. Почему? Исправь.
  function Field() {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={`Сообщение для ${contact.name}`}
        rows={4}
        cols={40}
      />
    );
  }

  return (
    <div>
      <p>Чат с {contact.name}</p>
      <Field />
    </div>
  );
}
