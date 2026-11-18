/**
 * One empty state for the whole app: heading, one line, one action,
 * centred as a group in the content area. Used when a page or range
 * has no data, and when data couldn't load. No box, no background.
 */
export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="app-empty" role="status">
      <div className="app-empty-inner">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {action && <div className="app-empty-action">{action}</div>}
      </div>
    </div>
  );
}
