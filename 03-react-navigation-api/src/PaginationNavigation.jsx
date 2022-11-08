import { useState, useEffect, useSyncExternalStore } from "react";

class Cache {
  #loaderData = new Map();
  #listeners = [];

  #notify = () => {
    this.#listeners.forEach((listener) => listener());
  };

  set = (path, data) => {
    this.#loaderData.set(path, data);
    this.#notify();
  };

  get = (path) => {
    return this.#loaderData.get(path);
  };

  subscribe = (listener) => {
    this.#listeners.push(listener);

    return () => this.#listeners.splice(this.#listeners.indexOf(listener), 1);
  };
}

let cache = new Cache();
window.cache = cache;

function useLoaderData(path) {
  return useSyncExternalStore(cache.subscribe, () => cache.get(path));
}

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

function parsePage(page) {
  return Math.max(parseInt(page, 10) || 1, 1);
}

function About() {
  const { data } = useLoaderData("/about") ?? { data: [] };

  function onPrev() {
    const url = new URL(window.location.toString());
    url.searchParams.set(
      "page",
      Math.max(1, parsePage(url.searchParams.get("page")) - 1)
    );

    window.navigation.navigate(url.toString());
  }

  function onNext() {
    const url = new URL(window.location.toString());
    url.searchParams.set("page", parsePage(url.searchParams.get("page")) + 1);

    window.navigation.navigate(url.toString());
  }

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
      <div className="flex gap-2 mt-2">
        <button
          className="rounded bg-slate-200 hover:bg-slate-400 px-4 py-2"
          onClick={onPrev}
        >
          Prev
        </button>
        <button
          className="rounded bg-slate-200 hover:bg-slate-400 px-4 py-2"
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

async function aboutLoader({ url, abortSignal }) {
  const page = parsePage(url.searchParams.get("page"));
  const response = await fetch(`https://reqres.in/api/users?page=${page}`, {
    signal: abortSignal,
  });
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

  async function preloadData(url, abortSignal) {
    const path = url.pathname;
    const config = routesConfig.find((config) => config.path === path);

    if (config.loader) {
      cache.set(path, await config.loader({ url, abortSignal }));
    }
  }

  function render(url, abortSignal) {
    const path = url.pathname;
    const config = routesConfig.find((config) => config.path === path);

    setCurrentComponent(config.element);
  }

  useEffect(() => {
    const url = new URL(window.location.toString());
    preloadData(url).then(() => render(url));
  }, []);

  useEffect(() => {
    const onNavigate = (event) => {
      event.intercept({
        async handler() {
          const url = new URL(event.destination.url);
          await preloadData(url, event.signal);

          render(url);
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
