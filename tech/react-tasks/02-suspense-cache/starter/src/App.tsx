import { Suspense, useState } from "react";
import { useUser } from "./useUser";

function Profile({ userId }: { userId: string }) {
  const user = useUser(userId);
  return <p>{user.name}</p>;
}

export default function App() {
  const [userId, setUserId] = useState("1");

  return (
    <>
      <button onClick={() => setUserId((id) => (id === "1" ? "2" : "1"))}>
        Сменить пользователя
      </button>
      <Suspense fallback={<p>Загрузка...</p>}>
        <Profile userId={userId} />
      </Suspense>
    </>
  );
}
