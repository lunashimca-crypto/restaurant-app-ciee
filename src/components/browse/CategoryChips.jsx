export default function CategoryChips({ items, activeId, onSelect }) {
  return (
    <div className="category-chips">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`category-chip${item.id === activeId ? " active" : ""}`}
          onClick={() => onSelect(item.id)}
        >
          {item.icon ? `${item.icon} ` : ""}
          {item.label}
        </button>
      ))}
    </div>
  );
}
