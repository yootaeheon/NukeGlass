import { notFound } from "next/navigation";

// Unknown paths under a language (/ja/nope) render [lang]/not-found inside the site layout,
// instead of Next's bare default 404.
export default function CatchAll() {
  notFound();
}
