import { useEffect, useState } from 'react';

/**
 * Accessible DOB entry: type year / month / day (easy for older users)
 * plus optional native calendar picker.
 *
 * Month/day use local draft state so typing "1" then "5" becomes day 15 —
 * we only zero-pad when the field is complete (2 digits) or on blur.
 */
export default function DateOfBirthFields({ value = '', onChange, id = 'dob', label = 'Birthday' }) {
  const parseIso = (v) => {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      // partial compose value: year-month-day without forced pads
      const parts = String(v || '').split('-');
      return {
        y: parts[0] || '',
        m: parts[1] || '',
        d: parts[2] || '',
      };
    }
    const [y, m, d] = v.split('-');
    return { y, m, d };
  };

  const initial = parseIso(value);
  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m.replace(/^0(?=\d)/, '') || initial.m); // show unpadded while editing when partial
  const [day, setDay] = useState(initial.d.replace(/^0(?=\d)/, '') || initial.d);

  // Sync from parent when value is a complete ISO (e.g. calendar picker)
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    } else if (!value) {
      setYear('');
      setMonth('');
      setDay('');
    }
  }, [value]);

  const emitComplete = (yy, mm, dd) => {
    const y = String(yy || '').replace(/\D/g, '').slice(0, 4);
    const mRaw = String(mm || '').replace(/\D/g, '').slice(0, 2);
    const dRaw = String(dd || '').replace(/\D/g, '').slice(0, 2);

    if (!y && !mRaw && !dRaw) {
      onChange('');
      return;
    }

    // Only emit full ISO when year is 4 digits AND month AND day are complete enough
    // Month/day: 2 digits, OR 1 digit only if clearly finished via blur (caller pads)
    const monthReady = mRaw.length === 2 || (mRaw.length === 1 && Number(mRaw) >= 1);
    const dayReady = dRaw.length === 2 || (dRaw.length === 1 && Number(dRaw) >= 1);

    // While user is still typing a second digit, do NOT pad early.
    // Complete only when: year=4 AND month has 2 digits AND day has 2 digits,
    // OR when forcePad (blur) with valid single digits.
    return { y, mRaw, dRaw, monthReady, dayReady };
  };

  const tryEmit = (yy, mm, dd, { forcePad = false } = {}) => {
    const { y, mRaw, dRaw } = emitComplete(yy, mm, dd);

    if (!y && !mRaw && !dRaw) {
      onChange('');
      return;
    }

    const monthComplete = mRaw.length === 2 || (forcePad && mRaw.length === 1);
    const dayComplete = dRaw.length === 2 || (forcePad && dRaw.length === 1);

    if (y.length === 4 && monthComplete && dayComplete && mRaw.length >= 1 && dRaw.length >= 1) {
      const mo = mRaw.padStart(2, '0');
      const da = dRaw.padStart(2, '0');
      const nMo = Number(mo);
      const nDa = Number(da);
      const nY = Number(y);
      if (nY >= 1900 && nY <= 2100 && nMo >= 1 && nMo <= 12 && nDa >= 1 && nDa <= 31) {
        onChange(`${y}-${mo}-${da}`);
        // Keep display as padded once complete
        setMonth(mo);
        setDay(da);
        return;
      }
    }

    // Partial — store draft without padding so day 1… can become 10–31
    const partial = [y, mRaw, dRaw].filter((p) => p !== '').join('-');
    // Prefer a structured partial marker parent can detect as incomplete
    if (y || mRaw || dRaw) {
      onChange(`${y || ''}-${mRaw || ''}-${dRaw || ''}`);
    } else {
      onChange('');
    }
    void partial;
  };

  const onYear = (raw) => {
    const v = raw.replace(/\D/g, '').slice(0, 4);
    setYear(v);
    tryEmit(v, month, day);
  };

  const onMonth = (raw) => {
    let v = raw.replace(/\D/g, '').slice(0, 2);
    // Block impossible first digit for month (only 0,1 allowed for tens)
    if (v.length === 1 && Number(v) > 1) {
      // single digit 2-9 is valid month; keep as single until blur/second digit
    }
    if (v.length === 2 && Number(v) > 12) v = v.slice(0, 1);
    if (v.length === 2 && Number(v) === 0) v = '01';
    setMonth(v);
    // Only auto-complete when month has 2 digits (or will on blur)
    tryEmit(year, v, day, { forcePad: false });
  };

  const onDay = (raw) => {
    let v = raw.replace(/\D/g, '').slice(0, 2);
    if (v.length === 2 && Number(v) > 31) v = v.slice(0, 1);
    if (v.length === 2 && Number(v) === 0) v = '01';
    setDay(v);
    // Critical: do NOT pad when only 1 digit — user may type 10–31
    tryEmit(year, month, v, { forcePad: false });
  };

  const blurMonth = () => {
    if (month.length === 1 && Number(month) >= 1 && Number(month) <= 9) {
      const padded = month.padStart(2, '0');
      setMonth(padded);
      tryEmit(year, padded, day, { forcePad: true });
    } else {
      tryEmit(year, month, day, { forcePad: true });
    }
  };

  const blurDay = () => {
    if (day.length === 1 && Number(day) >= 1 && Number(day) <= 9) {
      const padded = day.padStart(2, '0');
      setDay(padded);
      tryEmit(year, month, padded, { forcePad: true });
    } else {
      tryEmit(year, month, day, { forcePad: true });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#4a1942]/55">{label}</p>
      <p className="text-[11px] text-[#4a1942]/50">
        Type the numbers (easier than hunting a tiny calendar) — or use the calendar if you prefer.
        Days 10–31: type both digits (e.g. 15).
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
            value={year}
            onChange={(e) => onYear(e.target.value)}
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
            value={month}
            onChange={(e) => onMonth(e.target.value)}
            onBlur={blurMonth}
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
            value={day}
            onChange={(e) => onDay(e.target.value)}
            onBlur={blurDay}
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
          onChange={(e) => {
            const v = e.target.value;
            onChange(v);
            if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
              const [y, m, d] = v.split('-');
              setYear(y);
              setMonth(m);
              setDay(d);
            }
          }}
        />
      </label>
      {value && !/^\d{4}-\d{2}-\d{2}$/.test(value) && (
        <p className="text-[11px] text-amber-800">
          Finish year (4 digits), month, and day so we can weave the chart. Single-digit days pad when you leave the field.
        </p>
      )}
    </div>
  );
}
