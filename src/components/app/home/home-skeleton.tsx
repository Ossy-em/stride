/**
 * Home loading state. Mirrors HomeView piece for piece (greeting top-left,
 * then the column: title, start box, Activity stats, Focus list) so the
 * page doesn't shift when data arrives.
 */

const Bar = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: React.CSSProperties }) => (
  <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
);

export default function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="home-greet">
        <Bar w={148} h={14} style={{ margin: "3px 0" }} />
      </div>

      <div className="app-page home-page">
        <Bar w="68%" h={24} r={8} style={{ margin: "4px 0" }} />
        <Bar w="40%" h={15} style={{ marginTop: 10 }} />

        <div className="home-start">
          <div className="app-composer">
            <Bar w="38%" h={15} style={{ margin: "3px 0" }} />
            <div className="app-composer-row">
              <div className="home-chips" style={{ gap: 12 }}>
                <Bar w={104} h={16} />
                <Bar w={68} h={16} />
              </div>
              <Bar w={112} h={32} r={999} />
            </div>
          </div>
          <Bar w="52%" h={12} style={{ margin: "15px 2px 0" }} />
        </div>

        <section className="app-section">
          <Bar w={52} h={11} style={{ margin: "0 2px 14px" }} />
          <div className="app-list">
            <div className="app-stats">
              {[0, 1, 2, 3].map((i) => (
                <div className="app-stat" key={i}>
                  <Bar w={44} h={10} style={{ margin: "3px 0" }} />
                  <Bar w={56} h={22} r={6} style={{ marginTop: 9 }} />
                  <Bar w={60} h={10} style={{ marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-section">
          <Bar w={44} h={11} style={{ margin: "0 2px 14px" }} />
          <div className="app-list">
            {[38, 30, 22].map((w, i) => (
              <div className="app-row" key={i}>
                <Bar w={16} h={16} r={999} />
                <div className="app-row-main">
                  <Bar w={`${w}%`} h={13} style={{ margin: "3px 0" }} />
                  <Bar w={`${w + 26}%`} h={11} style={{ marginTop: 7 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
