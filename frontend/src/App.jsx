import Navbar from "./components/Navbar.jsx";
import AppRouter from "./routes/AppRouter.jsx";
import NexiaChatbot from "./components/NexiaChatbot.jsx";

export default function App() {
  return (
    <div>
      <Navbar />
      <AppRouter />
      <NexiaChatbot />
    </div>
  );
}
