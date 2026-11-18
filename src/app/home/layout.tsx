import AppFrame from "@/components/app/app-frame";

/** Home sits inside the app shell; AppFrame handles the sign-in and onboarding gate. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/home">{children}</AppFrame>;
}
