import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin Tailwind to this project folder. Without it, Tailwind resolves from
// the dev server's working directory, and starting it from anywhere else
// (e.g. the home folder) fails with "Can't resolve 'tailwindcss'".
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": { base: projectRoot },
  },
};

export default config;
