import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import { resolveVendorIdForUser } from '../lib/vendorCatalogLoad';
import {
  autoDetectOnboarding,
  getSellerPath,
  isIdStepSatisfied,
  nextIncompleteStep,
  offersServices,
} from '../lib/onboardingApi';
import { fetchIdentityVerification } from '../lib/verificationApi';
import { supabase } from '../lib/supabaseClient';

/**
 * Seller task board: launch steps + ID verification + open order todos.
 * Replaces the old dead /api/tasks mock board.
 */
export default function Tasks({ user }) {
  const ctx = getVendorContext(user);
  const [vendorId, setVendorId] = useState(ctx?.vendorId || user?.vendor_id || null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let vid = vendorId;
      if (!vid && user?.email) {
        vid = await resolveVendorIdForUser(user);
        if (!cancelled && vid) setVendorId(vid);
      }
      if (!vid) {
        if (!cancelled) {
          setTasks([]);
          setLoading(false);
        }
        return;
      }

      const [steps, identity, openOrders] = await Promise.all([
        autoDetectOnboarding(vid, {
          menuCount: 0,
          produceCount: 0,
          user,
        }),
        fetchIdentityVerification(vid).catch(() => null),
        supabase
          .from('orders')
          .select('id, status, total, date')
          .eq('vendor_id', vid)
          .in('status', ['placed', 'preparing', 'pending'])
          .order('id', { ascending: false })
          .limit(20)
          .then(({ data }) => data || [])
          .catch(() => []),
      ]);

      const list = [];

      const next = nextIncompleteStep(steps);
      if (next) {
        list.push({
          id: `launch-${next.id}`,
          title: `Launch: ${next.label}`,
          body: next.description || 'Finish this checklist step.',
          status: 'todo',
          href: next.path || '/vendor-dashboard',
          priority: 'high',
        });
      }

      const path = getSellerPath(steps);
      const needsId = offersServices(steps) || path === 'services' || path === 'both';
      if (needsId && !isIdStepSatisfied(steps) && !user?.identity_verified) {
        list.push({
          id: 'id-needed',
          title: 'Submit photo ID (services path)',
          body: 'Sessions/services require ID on file. Product-only shops can switch path to skip.',
          status: 'todo',
          href: '/vendor-verification',
          priority: 'high',
        });
      } else if (needsId && identity) {
        const st = String(identity.status || '').toLowerCase();
        if (st === 'pending' || st === 'flagged' || st === 'under_review') {
          list.push({
            id: 'id-pending',
            title: st === 'flagged' ? 'ID under admin review (flagged)' : 'ID submitted — waiting on review',
            body: 'You already submitted. No need to resubmit unless support asks for new photos.',
            status: 'inprogress',
            href: '/vendor-verification',
            priority: 'medium',
          });
        } else if (st === 'approved') {
          list.push({
            id: 'id-done',
            title: 'Photo ID approved',
            body: 'Identity verification complete.',
            status: 'done',
            href: '/vendor-verification',
            priority: 'low',
          });
        }
      }

      for (const o of openOrders) {
        list.push({
          id: `order-${o.id}`,
          title: `Fulfill order #${o.id}`,
          body: `$${Number(o.total || 0).toFixed(2)} · ${o.status}`,
          status: 'todo',
          href: '/orders',
          priority: 'medium',
        });
      }

      if (!list.length) {
        list.push({
          id: 'all-clear',
          title: 'No open tasks',
          body: 'Launch checklist clear. New orders and ID reminders will show here.',
          status: 'done',
          href: '/vendor-dashboard',
          priority: 'low',
        });
      }

      if (!cancelled) {
        setTasks(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vendorId, user?.email]);

  const columns = {
    todo: tasks.filter((t) => t.status === 'todo'),
    inprogress: tasks.filter((t) => t.status === 'inprogress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Tasks</h1>
      <p className="text-sm text-gray-600 mb-6">
        Launch steps, ID verification, and open orders for your shop.
      </p>
      {loading ? (
        <p className="text-sm text-gray-500">Loading tasks…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(columns).map(([status, list]) => (
            <div key={status} className="bg-white border rounded-3xl p-4 min-h-[280px]">
              <div className="font-semibold mb-4 capitalize flex justify-between">
                {status.replace('inprogress', 'In progress')}
                <span className="text-gray-400 font-normal">({list.length})</span>
              </div>
              <div className="space-y-3">
                {list.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl text-sm border ${
                      task.priority === 'high' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="font-medium text-[#4a1942]">{task.title}</div>
                    <div className="text-xs text-gray-600 mt-1 leading-snug">{task.body}</div>
                    {task.href && (
                      <Link
                        to={task.href}
                        className="inline-block mt-3 text-xs font-semibold text-[#4a1942] underline"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                ))}
                {list.length === 0 && (
                  <p className="text-xs text-gray-400">Nothing here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
