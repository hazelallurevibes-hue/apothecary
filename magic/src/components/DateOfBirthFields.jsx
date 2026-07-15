/**
 * Accessible DOB entry: type year / month / day (easy for older users)
 * plus optional native calendar picker.
 */
export default function DateOfBirthFields({ value = '', onChange, id = 'dob', label = 'Birthday' }) {
  const [y, m, d] = (value || '').split('-');

  const emit = (yy, mm, dd) => {
    if (!yy && !mm && !dd) {
      onChange('');
      return;
    }
    const year = String(yy || '').replace(/\D/g, '').slice(0, 4);
    const month = String(mm || '').replace(/\D/g, '').slice(0, 2);
    const day = String(dd || '').replace(/\D/g, '').slice(0, 2);
    if (year.length === 4 && month.length >= 1 && day.length >= 1) {
      const mo = month.padStart(2, '0');
      const da = day.padStart(2, '0');
      // Validate roughly
      const nMo = Number(mo);
      const nDa = Number(da);
      const nY = Number(year);
      if (nY >= 1900 && nY <= 2100 && nMo >= 1 && nMo <= 12 && nDa >= 1 && nDa <= 31) {
        onChange(`${year}-${mo}-${da}`);
        return;
      }
    }
    // partial — keep composing without forcing invalid ISO
    onChange([year, month, day].filter(Boolean).join('-').length ? `${year || ''}-${month || ''}-${day || ''}` : '');
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#4a1942]/55">{label}</p>
      <p className="text-[11px] text-[#4a1942]/50">
        Type the numbers (easier than hunting a tiny calendar) — or use the calendar if you prefer.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase text-[#4a1942]/40">Year</span>
          <input
            id={`${id}-y`}
            className="input mt-0.5"
            inputMode="numeric"
            placeholder="1955"
            maxLength={4}
            value={y || ''}
            onChange={(e) => emit(e.target.value, m, d)}
            autoComplete="bday-year"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase text-[#4a1942]/40">Month</span>
          <input
            id={`${id}-m`}
            className="input mt-0.5"
            inputMode="numeric"
            placeholder="06"
            maxLength={2}
            value={m || ''}
            onChange={(e) => emit(y, e.target.value, d)}
            autoComplete="bday-month"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase text-[#4a1942]/40">Day</span>
          <input
            id={`${id}-d`}
            className="input mt-0.5"
            inputMode="numeric"
            placeholder="15"
            maxLength={2}
            value={d || ''}
            onChange={(e) => emit(y, m, e.target.value)}
            autoComplete="bday-day"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] font-bold uppercase text-[#4a1942]/40">Or pick on calendar</span>
        <input
          id={id}
          type="date"
          className="input mt-0.5"
          value={value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {value && !/^\d{4}-\d{2}-\d{2}$/.test(value) && (
        <p className="text-[11px] text-amber-800">Finish year (4 digits), month, and day so we can weave the chart.</p>
      )}
    </div>
  );
}
