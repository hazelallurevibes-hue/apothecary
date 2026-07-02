import { Link } from 'react-router-dom';
import TarotCollectionPanel from '../components/TarotCollectionPanel';

export default function TarotCollection({ user }) {
  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Link to="/" className="text-sm text-[#4a1942] mb-4 inline-block">← Home</Link>
      <TarotCollectionPanel user={user} />
    </div>
  );
}