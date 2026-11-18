"use client";

import PageHeader from "../page-header";
import StartCard from "../home/start-card";

/** /session/start inside the shell: same start form as Home and the modal. */
export default function StartPage() {
  return (
    <>
      <PageHeader title="Start session" />
      <div className="app-scroll">
        <div className="app-page home-page">
          <h2 className="home-title">Start a focus session</h2>
          <p className="home-sub">What do you want to accomplish?</p>
          <StartCard autoFocus />
        </div>
      </div>
    </>
  );
}
