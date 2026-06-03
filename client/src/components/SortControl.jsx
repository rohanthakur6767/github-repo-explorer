const OPTIONS = [
  { value: 'updated', label: 'Last updated' },
  { value: 'stars', label: 'Stars' },
  { value: 'name', label: 'Name' },
];

/** Dropdown that lets the user choose how the repo list is sorted. */
export default function SortControl({ value, onChange, disabled }) {
  return (
    <div className="sort-control">
      <label htmlFor="sort">Sort by</label>
      <select
        id="sort"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
