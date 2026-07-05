import { useState } from 'react';

/** Password field with show/hide toggle — matches auth form styling */
export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
  minLength,
  required = true,
  className = '',
  inputClassName = '',
  error = false,
  id,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border p-3.5 pr-[4.5rem] rounded-2xl text-sm ${error ? 'border-red-400' : ''} ${inputClassName}`}
        minLength={minLength}
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4a1942]/65 hover:text-[#4a1942] px-1.5 py-0.5 rounded-lg hover:bg-[#4a1942]/5 transition"
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        tabIndex={-1}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}