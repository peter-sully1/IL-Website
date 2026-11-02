export function PageIntro({ title, arabic }: { title: string; arabic: string }) {
  return (
    <div className="page-intro">
      <div className="wrap">
        <span className="ar" lang="ar">{arabic}</span>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
