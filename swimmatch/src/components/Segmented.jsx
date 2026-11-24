// Pill-shaped segmented control (Search, Lessons). `options` is [[value, label], ...].
export default function Segmented({ label, name, value, options, onChange, tone = "" }) {
  return (
    <div className={`seg ${tone}`} role="group" aria-label={label}>
      {options.map(([optionValue, text]) => (
        <button key={text} type="button" aria-pressed={value === optionValue} onClick={() => onChange(name, optionValue)}>{text}</button>
      ))}
    </div>
  );
}
