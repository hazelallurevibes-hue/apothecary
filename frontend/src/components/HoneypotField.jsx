/** Hidden field — bots often fill this; humans never see it. */
export default function HoneypotField({ value, onChange }) {
  return (
    <div
      className="absolute -left-[9999px] w-px h-px overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <label htmlFor="hp-website">Company website</label>
      <input
        id="hp-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}