import { useEffect } from "react";
import { useState } from "react";

function Home() {
  return (
    <div className="p-8">
      <nav className="flex gap-2 -mx-4 mb-4">
        <a href="/" className="px-4 py-2 hover:bg-blue-200 rounded bg-blue-300">
          Home
        </a>
        <a href="/about" className="px-4 py-2 hover:bg-blue-200 rounded">
          About
        </a>
      </nav>

      <h1 className="text-2xl font-bold">Home Page</h1>
    </div>
  );
}

function About() {
  return (
    <div className="p-8">
      <nav className="flex gap-2 -mx-4 mb-4">
        <a href="/" className="px-4 py-2 hover:bg-blue-200 rounded">
          Home
        </a>
        <a
          href="/about"
          className="px-4 py-2 hover:bg-blue-200 rounded bg-blue-300"
        >
          About
        </a>
      </nav>

      <h1 className="text-2xl font-bold">About Page</h1>
    </div>
  );
}

const routesConfig = {
  "/": <Home />,
  "/about": <About />,
};

function App() {
  const [currentComponent, setCurrentComponent] = useState(null);

  function render(path) {
    setCurrentComponent(routesConfig[path] ?? <Home />);
  }

  useEffect(() => {
    render(new URL(window.location.toString()).pathname);
  }, []);

  useEffect(() => {
    const onNavigate = (event) => {
      event.intercept({
        async handler() {
          render(new URL(event.destination.url).pathname);
        },
      });
    };

    window.navigation.addEventListener("navigate", onNavigate);

    return () => {
      window.navigation.removeEventListener("navigate", onNavigate);
    };
  }, []);

  return <div className="App">{currentComponent}</div>;
}

export default App;
