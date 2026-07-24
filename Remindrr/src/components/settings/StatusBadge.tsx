// Connection-status pill — shows a green "connected" or amber "not
// configured" state based on whether the listed fields are populated.

import { CheckIcon, AlertIcon } from './Icons';

export function StatusBadge({ label, connected, fields }: { label: string; connected: boolean; fields: string[] }) {
  const hasValue = fields.some(f => typeof f === 'string' && f.trim().length > 0);
  const isActive = connected && hasValue;
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      {isActive
        ? <><span className="text-green-500"><CheckIcon /></span> {label} connected</>
        : <><span className="text-amber-500"><AlertIcon /></span> {label} not configured</>
      }
    </div>
  );
}
