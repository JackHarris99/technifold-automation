'use client';

interface VATNumberDisplayProps {
  vatNumber: string | null;
  onEdit: () => void;
}

export default function VATNumberDisplay({ vatNumber, onEdit }: VATNumberDisplayProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">VAT Number</div>
        <button
          onClick={onEdit}
          className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          {vatNumber ? 'Edit' : 'Add'}
        </button>
      </div>

      {vatNumber ? (
        <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-base">✓</span>
            <div className="text-[13px] font-mono font-[700] text-[#059669]">{vatNumber}</div>
          </div>
          <p className="text-[10px] text-[#64748b] mt-1">0% VAT applies (EU Reverse Charge)</p>
        </div>
      ) : (
        <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] border-dashed">
          <p className="text-[11px] text-[#94a3b8] italic">
            No VAT number -{' '}
            <button onClick={onEdit} className="text-blue-600 hover:text-blue-700 font-[600] underline">
              Add now
            </button>
          </p>
          <p className="text-[10px] text-[#94a3b8] mt-1">20% UK VAT will be charged</p>
        </div>
      )}
    </div>
  );
}
