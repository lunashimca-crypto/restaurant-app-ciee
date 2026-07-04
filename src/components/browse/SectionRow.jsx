export default function SectionRow({ title, action, children }) {
  return (
    <section className="section-row">
      <div className="section-row-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="section-row-scroll">{children}</div>
    </section>
  );
}
