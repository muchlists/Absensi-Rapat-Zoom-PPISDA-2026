import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Meeting } from '../types';
import { formatOrganizerName } from '../utils/textUtils';

interface MeetingHeaderProps {
  meeting: Meeting;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({ meeting }) => {
  const formattedDate = new Date(meeting.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const organizerText = formatOrganizerName(meeting.organizer);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Banner Stripe */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 text-white">
        <div className="space-y-2.5 w-full">
          <div>
            <span className="inline-block text-[10px] sm:text-[11px] font-bold tracking-wide text-amber-300 bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-lg leading-relaxed max-w-full">
              {organizerText}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-snug break-words">
            {meeting.title}
          </h1>

          {meeting.agenda && (
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed break-words">
              <span className="font-semibold text-blue-200">Agenda:</span> {meeting.agenda}
            </p>
          )}
        </div>
      </div>

      {/* Meeting Meta Grid */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-50/80 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs text-slate-600">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Hari & Tanggal
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-0.5 leading-snug">
              {formattedDate}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Waktu Pelaksanaan
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-0.5 font-mono tabular-nums leading-snug">
              {meeting.timeStart} - {meeting.timeEnd || 'Selesai'} {meeting.timezone || 'WIB'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Lokasi / Akses Rapat
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-0.5 leading-snug break-words" title={meeting.location}>
              {meeting.location}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Pimpinan Rapat
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-0.5 leading-snug break-words" title={meeting.leader}>
              {meeting.leader}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
