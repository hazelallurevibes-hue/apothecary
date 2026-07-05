import { Link, useLocation } from 'react-router-dom';
import { buildBreadcrumbTrail } from '../lib/seo';
import { useSeoContext } from './SeoContext';

/** Visible breadcrumb trail matching BreadcrumbList schema */
export default function BreadcrumbNav({ className = '' }) {
  const { pathname } = useLocation();
  const { pageSeo } = useSeoContext();
  const items = buildBreadcrumbTrail(pathname, pageSeo || {});

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-x-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-gray-300 select-none">
                  /
                </span>
              )}
              {isLast ? (
                <span className="text-[#4a1942] font-medium truncate max-w-[14rem] sm:max-w-none" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className="hover:text-[#4a1942] transition-colors whitespace-nowrap">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}