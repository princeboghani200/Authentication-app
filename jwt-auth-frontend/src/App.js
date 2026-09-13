import { useState } from "react";
import Login from "./Login";
import PrivatePage from "./PrivatePage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );

  return (
    <div style={{ padding: "2rem" }}>
      {isLoggedIn ? (
        <PrivatePage onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
