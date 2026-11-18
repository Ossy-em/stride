import { notFound } from "next/navigation";

// Preview screens with sample data, for local work and filming only.
// In production they 404 so they never get crawled or seen.
export default function DevPreviewLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
