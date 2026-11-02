import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  {
    // The render loop mutates three.js objects imperatively by design (useFrame).
    files: ["src/components/three/**"],
    rules: { "react-hooks/immutability": "off" },
  },
  { ignores: [".next/**", "node_modules/**", "scripts/**", "ghl/dist/**", "next-env.d.ts"] },
];
export default config;
