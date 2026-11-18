"use client";

/** The signed-in user's profile and session defaults, for any page in the app. */
import { createContext, useContext } from "react";

export type UserPrefs = {
  defaultDuration: number | null;
  defaultTaskType: "coding" | "writing" | "reading" | null;
};

const UserContext = createContext<UserPrefs>({ defaultDuration: null, defaultTaskType: null });
export const useUserPrefs = () => useContext(UserContext);

export function UserProvider({ prefs, children }: { prefs: UserPrefs; children: React.ReactNode }) {
  return <UserContext.Provider value={prefs}>{children}</UserContext.Provider>;
}
