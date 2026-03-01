import "../App.css";
import { AuthInit } from "../components/AuthInit";
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

