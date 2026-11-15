import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, MapPin, Clock, 
  ExternalLink, RefreshCw, Phone, User, Eye, Check, Filter,
  Search, Shield, Bell, Navigation, AlertOctagon, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../utils/adminApi';
import StatCard from '../../components/admin/StatCard';
import LoadingSkeleton from '../../components/admin/LoadingSkeleton';
import EmptyState from '../../components/admin/EmptyState';

const EMERGENCY_THEMES = {
  'Security Threat / Violence': { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
  'Medical Emergency': { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' },
  'Women Passenger Assistance': { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  'Women Safety / RPF': { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  'Derailment / Fire / Hazard': { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
  'Theft / Harassment / Distress': { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' }
};

export default function SecurityAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active'); // 'all' | 'active' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAlerts = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await adminApi.getSecurityAlerts();
      if (res.data?.success && Array.isArray(res.data?.alerts)) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load security alerts:', err);
      if (!isSilent) toast.error('Failed to refresh emergency alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-poll for live SOS alerts every 12 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAlerts]);

  const handleResolveAlert = async (id) => {
    try {
      await adminApi.resolveSecurityAlert(id);
      toast.success(`Alert #${id} marked as resolved.`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, is_resolved: true } : a));
      if (selectedAlert?.id === id) {
        setSelectedAlert(prev => ({ ...prev, resolved: true, is_resolved: true }));
      }
    } catch (err) {
      console.error('Resolve error:', err);
      toast.error('Failed to resolve alert.');
    }
  };

  const isAlertResolved = (a) => Boolean(a.resolved || a.is_resolved);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const resolved = isAlertResolved(a);
      if (activeFilter === 'active' && resolved) return false;
      if (activeFilter === 'resolved' && !resolved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refStr = `AEV-SOS-${a.id} AEV-GUEST-${a.id}`.toLowerCase();
        const typeStr = (a.details?.emergency_type || a.alert_type || '').toLowerCase();
        const locStr = (a.location || a.details?.location_name || '').toLowerCase();
        const nameStr = (a.User?.name || a.details?.passenger_name || '').toLowerCase();
        const noteStr = (a.details?.note || '').toLowerCase();
        return refStr.includes(q) || typeStr.includes(q) || locStr.includes(q) || nameStr.includes(q) || noteStr.includes(q);
      }
      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Statistics
  const activeCount = alerts.filter(a => !isAlertResolved(a)).length;
  const resolvedCount = alerts.filter(a => isAlertResolved(a)).length;
  const sosDispatchedCount = alerts.filter(a => a.alert_type === 'SOS_DISPATCHED').length;

  return (
    <div className="space-y-6 text-[#202A32] dark:text-[#F8FAFC]">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Live Incident Command
            </span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white animate-pulse">
                {activeCount} ACTIVE SOS
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Emergency SOS & Safety Alarms
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time transit SOS dispatches, passenger GPS coordinates, coach details, and RPF responders.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded accent-teal-600 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Auto-poll (12s)</span>
          </label>

          <button
            onClick={() => fetchAlerts(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B242E] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-500 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${activeCount > 0 ? 'bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/20' : 'bg-white dark:bg-[#1B242E] border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Active Unresolved SOS</span>
            <AlertOctagon className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">{activeCount}</p>
          <span className="text-[11px] text-rose-600/80 font-medium">Immediate RPF dispatch required</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B242E] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Alarms Dispatched</span>
            <ShieldAlert className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">{sosDispatchedCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Logged in system database</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B242E] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved Incidents</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black font-mono text-emerald-600 mt-2">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium">Acknowledged & closed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1B242E] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rapid Helplines</span>
            <Phone className="w-5 h-5 text-sky-500" />
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">139 (Railways)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">112 (Police)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">182 (RPF Women)</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Live nationwide dispatch lines</span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active Alarms ({activeCount})
          </button>
          <button
            onClick={() => setActiveFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Incidents ({alerts.length})
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref, station, passenger, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B242E] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ALERTS FEED CONTAINER */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#1B242E] rounded-2xl border border-slate-200 dark:border-slate-800">
          <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No incidents found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeFilter === 'active' 
              ? 'No active high-priority emergencies reported right now.' 
              : 'No incidents match your selected filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isResolved = isAlertResolved(alert);
            const passengerName = alert.User?.name || alert.details?.passenger_name || 'Guest Passenger';
            const passengerEmail = alert.User?.email || alert.details?.passenger_email || 'Unregistered Guest';
            const emergencyType = alert.details?.emergency_type || alert.alert_type?.replace('_', ' ') || 'Emergency Alarm';
            const locationStr = alert.details?.location_name || alert.location || 'Unknown Coordinates';
            const noteStr = alert.details?.note;
            const refCode = alert.User ? `AEV-SOS-${alert.id}` : `AEV-GUEST-${alert.id}`;
            const timeAgo = alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN') : '--';
            const theme = EMERGENCY_THEMES[emergencyType] || { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' };

            // Extract lat & lng from location or details
            const lat = alert.details?.latitude || (alert.location && alert.location.includes('LAT:') ? alert.location.match(/LAT:\s*([0-9.-]+)/)?.[1] : null);
            const lng = alert.details?.longitude || (alert.location && alert.location.includes('LNG:') ? alert.location.match(/LNG:\s*([0-9.-]+)/)?.[1] : null);
            const mapsUrl = (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-white/70 dark:bg-[#1B242E]/70 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-[#1B242E] border-rose-500/40 shadow-sm ring-1 ring-rose-500/15'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Ref, Type & Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {refCode}
                      </span>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
                        {emergencyType}
                      </span>

                      {isResolved ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" /> Active Dispatch
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto lg:ml-0">
                        <Clock className="w-3 h-3" /> {timeAgo}
                      </span>
                    </div>

                    {/* Passenger & Reported Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger Information</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{passengerName} ({passengerEmail})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">IP: {alert.ip_address || '127.0.0.1'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Location & GPS</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Open in Google Maps ({lat}, {lng})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Passenger Note / Berth Info */}
                    {noteStr && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">Train / Coach / Berth Note:</span>
                        <p className="mt-0.5 font-medium">{noteStr}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {!isResolved ? (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge & Resolve</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Incident Closed
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <a
                        href="tel:139"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                        title="Dial 139 (Indian Railways Help)"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>139</span>
                      </a>
                      <a
                        href="tel:112"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                        title="Dial 112 (Police Dispatch)"
                      >
                        <Phone className="w-3 h-3 text-rose-600" />
                        <span>112</span>
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
