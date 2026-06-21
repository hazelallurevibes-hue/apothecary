export default function PreorderBadge({ item }) {
  if (!item?.is_preorder) return null;
  return (
    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">
      PRE-ORDER{item.preorder_available_date ? ` • ${item.preorder_available_date}` : ''}
    </span>
  );
}