import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function SignUp() {
  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-4xl font-bold tracking-tight text-center text-[#4a1942]">Create your account</h1>
      <p className="text-center text-gray-500 mt-2 text-sm">Choose how you will use {VERTICAL.name}</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link
          to="/customer-signup"
          className="group bg-white border-2 border-gray-200 hover:border-[#4a1942] rounded-3xl p-6 transition shadow-sm hover:shadow-md"
        >
          <span className="text-3xl" aria-hidden>🌿</span>
          <h2 className="text-lg font-semibold text-[#4a1942] mt-3 group-hover:text-[#2d1230]">Seeker (Member)</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Book healing sessions, shop the apothecary, join the Hearth, and collect tarot delights.
          </p>
          <span className="inline-block mt-4 text-sm font-medium text-[#4a1942] underline">Sign up as a seeker →</span>
        </Link>

        <Link
          to="/vendor-signup"
          className="group bg-white border-2 border-gray-200 hover:border-[#c9a227] rounded-3xl p-6 transition shadow-sm hover:shadow-md"
        >
          <span className="text-3xl" aria-hidden>✦</span>
          <h2 className="text-lg font-semibold text-[#4a1942] mt-3 group-hover:text-[#2d1230]">Practitioner (Vendor)</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            List services, apothecary goods, and courses. Applications are reviewed before approval.
          </p>
          <span className="inline-block mt-4 text-sm font-medium text-[#4a1942] underline">Apply as a practitioner →</span>
        </Link>
      </div>

      <p className="text-center mt-8 text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-[#4a1942] font-medium hover:underline">Log in</Link>
      </p>
    </div>
  );
}