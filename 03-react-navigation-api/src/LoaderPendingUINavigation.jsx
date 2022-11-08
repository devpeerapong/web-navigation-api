import { useEffect } from "react";
import { useState } from "react";

let loaderData = new Map();

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
  const { data } = loaderData.get("/about");

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
      <h1 className="text-2xl font-bold mb-2">About Page</h1>
      <h4 className="text-lg text-slate-700 mb-1">Our users</h4>
      {data.map((item) => (
        <p className="text-slate-500" key={item.id}>
          {item.first_name}
        </p>
      ))}
    </div>
  );
}

function LoadingAbout() {
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

      <div className="text-lg p-4 text-bold text-slate-400">Loading ...</div>
    </div>
  );
}

async function fetchAbout() {
  const response = await fetch("https://reqres.in/api/users?page=1");
  const json = await response.json();

  console.log(json);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { data: json.data };
}

const routesConfig = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
    pendingElement: <LoadingAbout />,
    loader: () => fetchAbout(),
  },
];

function App() {
  const [currentComponent, setCurrentComponent] = useState(null);

  async function render(path) {
    const config = routesConfig.find((config) => config.path === path);

    if (config.pendingElement) {
      setCurrentComponent(config.pendingElement);
    }

    if (config.loader) {
      loaderData.set(path, await config.loader());
    }

    setCurrentComponent(config.element);
  }

  useEffect(() => {
    render(new URL(window.location.toString()).pathname);
  }, []);

  useEffect(() => {
    const onNavigate = (event) => {
      event.intercept({
        async handler() {
          await render(new URL(event.destination.url).pathname);
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
