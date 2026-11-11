import { useEffect, useState } from "react";
import { fetchUsers, type User } from "./api";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!query) return;

    fetchUsers(query).then((data) => {
      setUsers(data);
    });
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск"
      />
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return <UserSearch />;
}
