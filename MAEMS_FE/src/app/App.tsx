import "../App.css";
import { AuthInit } from "../auth/AuthInit";
import { AppRouter } from "../routes/AppRouter";

function App() {
  return (
    <>
      <AuthInit />
      <AppRouter />
    </>
  );
}

export default App;

