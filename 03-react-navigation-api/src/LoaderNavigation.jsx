import { useEffect, useState } from "react";

let loaderData = new Map();
window.loaderData = loaderData;

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
      {data.map((item) => (
        <p className="text-slate-500" key={item.id}>
          {item.first_name}
        </p>
      ))}
    </div>
  );
}

async function aboutLoader() {
  const response = await fetch(`https://reqres.in/api/users`);
  const json = await response.json();

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
    loader: aboutLoader,
  },
];

function App() {
  const [currentComponent, setCurrentComponent] = useState(null);

  async function render(path) {
    const config = routesConfig.find((config) => config.path === path);

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
