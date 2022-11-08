import './style.css';

const Home = `
<div class="p-8">
  <nav class="flex gap-2 -mx-4 mb-4">
    <a href="/" class="px-4 py-2 hover:bg-blue-200 rounded bg-blue-300">Home</a>
    <a href="/about" class="px-4 py-2 hover:bg-blue-200 rounded">About</a>
  </nav>

  <h1 class="text-2xl font-bold">Home Page</h1>
</div>
`;
const About = `
<div class="p-8">
  <nav class="flex gap-2 -mx-4 mb-4">
    <a href="/" class="px-4 py-2 hover:bg-blue-200 rounded">Home</a>
    <a href="/about" class="px-4 py-2 hover:bg-blue-200 rounded bg-blue-300">About</a>
  </nav>

  <h1 class="text-2xl font-bold">About Page</h1>
</div>
`;

const routesConfig = {
  "/": Home,
  "/about": About,
};

function render(path) {
  const currentElement = routesConfig[path] ?? Home;

  document.querySelector("#app").innerHTML = currentElement;
}

render(new URL(location.href).pathname);

navigation.addEventListener("navigate", (event) => {
  event.intercept({
    handler: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Navigation happens on the client side");
      render(new URL(event.destination.url).pathname)
    },
  });
});

