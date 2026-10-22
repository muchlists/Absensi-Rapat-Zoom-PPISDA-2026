import React, { useMemo } from 'react';

interface TimePicker24Props {
  value: string; // e.g. "09:00" or ""
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  quickPresets?: string[];
}

const HOURS_24 = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '23'
];

const MINUTES_5 = [
  '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'
];

export const TimePicker24: React.FC<TimePicker24Props> = ({
  value,
  onChange,
  allowEmpty = false,
  emptyLabel = 'Sampai Selesai',
  quickPresets
}) => {
  const parts = (value || '').split(':');
  const currentHour = parts[0] || (allowEmpty ? '' : '09');
  const currentMinute = parts[1] || (allowEmpty ? '' : '00');

  const handleHourChange = (newHour: string) => {
    if (!newHour) {
      onChange('');
      return;
    }
    const minute = currentMinute || '00';
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const hour = currentHour || '09';
    onChange(`${hour}:${newMinute}`);
  };

  // Ensure current minute is included if it's custom (e.g. "12")
  const minuteOptions = useMemo(() => {
    const base = [...MINUTES_5];
    if (currentMinute && !base.includes(currentMinute)) {
      base.push(currentMinute);
      base.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }
    return base;
  }, [currentMinute]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <select
          value={currentHour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 cursor-pointer"
        >
          {allowEmpty && (
            <option value="">-- {emptyLabel} --</option>
          )}
          {HOURS_24.map((h) => (
            <option key={h} value={h}>
              Jam {h}
            </option>
          ))}
        </select>

        <span className="font-bold text-slate-400 font-mono text-sm shrink-0">:</span>

        <select
          disabled={allowEmpty && !currentHour}
          value={currentMinute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
        >
          {allowEmpty && !currentHour && (
            <option value="">--</option>
          )}
          {minuteOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {quickPresets && quickPresets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md border transition-colors ${
                value === preset
                  ? 'bg-blue-900 text-white border-blue-900 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
