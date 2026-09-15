import { VERTICAL } from '../lib/vertical';

export default function Support() {
  const email = VERTICAL.contactEmail;
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-[#4a1942] mb-3">Support</h1>
      <p className="text-gray-600 mb-6">
        Ticket forms are not live yet. Email us and we will get back to you.
      </p>
      <div className="bg-white border rounded-3xl p-8">
        <a
          href={`mailto:${email}?subject=${encodeURIComponent('Hazel Allure support')}`}
          className="text-xl font-semibold text-[#4a1942] hover:underline"
        >
          {email}
        </a>
        <p className="text-sm text-gray-500 mt-4">
          Include your account email and order number if you have one.
        </p>
      </div>
    </div>
  );
}
