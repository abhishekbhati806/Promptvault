export default function CategoryPills({ categories, active, onSelect }) {
  return (
    <div className="cat-pills">
      <button
        type="button"
        className={`pill ${active === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`pill ${active === c.id ? 'active' : ''}`}
          onClick={() => onSelect(c.id)}
        >
          <span aria-hidden="true">{c.icon}</span> {c.name}
        </button>
      ))}
    </div>
  );
}
