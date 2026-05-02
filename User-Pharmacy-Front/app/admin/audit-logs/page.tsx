'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Download, Calendar, ShieldCheck, 
  AlertTriangle, CheckCircle, XCircle, Server, Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
type EventType = 'Authentication' | 'License Action' | 'User Management' | 'Alert Published' | 'Payment' | 'System' | 'Data Export';

interface AuditLog {
  id: string;
  timestamp: string;
  eventType: EventType;
  actor: { id: string; name: string };
  actionDesc: string;
  resource: string;
  result: 'Success' | 'Failure';
  ipAddress: string;
  integrity: 'Verified' | 'Tampered';
  details: {
    oldValue?: string;
    newValue?: string;
    sessionToken: string;
    requestContext: string;
    hmacSignature: string;
  };
}

const mockLogs: AuditLog[] = [
  {
    id: 'LOG-88291A',
    timestamp: '2023-11-24 14:32:01 EAT',
    eventType: 'License Action',
    actor: { id: 'ADM-001', name: 'Abebe Kebede' },
    actionDesc: 'Approved license for Selam Pharmacy',
    resource: 'Pharmacy ID #PH-2847',
    result: 'Success',
    ipAddress: '197.214.55.12',
    integrity: 'Verified',
    details: {
      oldValue: 'status: pending',
      newValue: 'status: active',
      sessionToken: 'sess_x89f2ma',
      requestContext: 'POST /api/v1/admin/license/approve',
      hmacSignature: 'sha256=8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a'
    }
  },
  {
    id: 'LOG-88291B',
    timestamp: '2023-11-24 14:15:22 EAT',
    eventType: 'Authentication',
    actor: { id: 'USR-892', name: 'Kidist Tefera' },
    actionDesc: 'Failed login attempt (Invalid password)',
    resource: 'Account #USR-892',
    result: 'Failure',
    ipAddress: '196.189.12.88',
    integrity: 'Verified',
    details: {
      sessionToken: 'none',
      requestContext: 'POST /api/v1/auth/login',
      hmacSignature: 'sha256=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    }
  },
  {
    id: 'LOG-88291C',
    timestamp: '2023-11-24 13:05:45 EAT',
    eventType: 'Alert Published',
    actor: { id: 'SYS-000', name: 'SYSTEM' },
    actionDesc: 'Published automated alert for Malaria surge',
    resource: 'Alert #ALT-102',
    result: 'Success',
    ipAddress: '10.0.0.52',
    integrity: 'Verified',
    details: {
      newValue: '{"region": "Amhara", "disease": "Malaria", "severity": "high"}',
      sessionToken: 'sys_cron_token',
      requestContext: 'Internal Job Scheduler',
      hmacSignature: 'sha256=7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
    }
  },
  {
    id: 'LOG-88291D',
    timestamp: '2023-11-24 11:20:10 EAT',
    eventType: 'User Management',
    actor: { id: 'ADM-002', name: 'Sara Alemu' },
    actionDesc: 'Suspended user account',
    resource: 'Account #USR-105',
    result: 'Success',
    ipAddress: '197.214.55.18',
    integrity: 'Tampered',
    details: {
      oldValue: 'status: active',
      newValue: 'status: suspended',
      sessionToken: 'sess_y29f2px',
      requestContext: 'POST /api/v1/admin/users/suspend',
      hmacSignature: 'sha256=INVALID_SIGNATURE_DETECTED'
    }
  },
  {
    id: 'LOG-88291E',
    timestamp: '2023-11-24 09:45:33 EAT',
    eventType: 'Data Export',
    actor: { id: 'ADM-001', name: 'Abebe Kebede' },
    actionDesc: 'Exported transaction logs (CSV)',
    resource: 'Data Export Job #EXP-992',
    result: 'Success',
    ipAddress: '197.214.55.12',
    integrity: 'Verified',
    details: {
      newValue: 'Format: CSV, Date Range: 2023-10-01 to 2023-10-31',
      sessionToken: 'sess_x89f2ma',
      requestContext: 'POST /api/v1/admin/export/transactions',
      hmacSignature: 'sha256=9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
    }
  }
];

const eventColorMap: Record<EventType, string> = {
  'Authentication': 'bg-blue-100 text-blue-800 border-blue-200',
  'License Action': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'User Management': 'bg-amber-100 text-amber-800 border-amber-200',
  'Alert Published': 'bg-red-100 text-red-800 border-red-200',
  'Payment': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'System': 'bg-gray-100 text-gray-800 border-gray-200',
  'Data Export': 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Calculate tampered count
  const tamperedCount = mockLogs.filter(log => log.integrity === 'Tampered').length;
  const isAllVerified = tamperedCount === 0;

  const toggleRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header and Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-brand-600" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tamper-evident, searchable record of all critical system actions.
          </p>
        </div>
        <button 
          onClick={() => alert("Exporting Audit Logs as CSV...")}
          className="flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Integrity Verification Banner */}
      <div className={`p-4 rounded-xl border flex items-start md:items-center gap-3 ${
        isAllVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200 text-red-900'
      }`}>
        {isAllVerified ? (
          <>
            <ShieldCheck className="w-6 h-6 text-emerald-600 min-w-shrink-0" />
            <span className="font-bold text-emerald-900">
              ✓ All {mockLogs.length.toLocaleString()} log entries verified — no tampering detected
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-6 h-6 text-red-600 min-w-shrink-0" />
            <span className="font-bold text-red-900 text-sm md:text-base">
              ⚠️ {tamperedCount} entries failed integrity check — investigation required
            </span>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100 flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by user ID, email, action type, resource ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
            Action Type
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
            Actor Role
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
            Result
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action & Resource
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Integrity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockLogs.map((log) => {
                const isExpanded = expandedRow === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-50 hover:bg-brand-50' : ''}`}
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium font-mono">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${eventColorMap[log.eventType]}`}>
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{log.actor.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{log.actor.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-sm">
                          <span className="text-sm text-gray-900 truncate" title={log.actionDesc}>{log.actionDesc}</span>
                          <span className="text-xs text-brand-600 font-medium truncate" title={log.resource}>{log.resource}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.result === 'Success' ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 text-sm font-bold">
                            <CheckCircle className="w-4 h-4" /> Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-700 text-sm font-bold">
                            <XCircle className="w-4 h-4" /> Failure
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.integrity === 'Verified' ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 text-sm font-bold">
                            <ShieldCheck className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-700 text-sm font-bold">
                            <AlertTriangle className="w-4 h-4" /> Tampered
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expandable Details Row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-gray-200">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50 border-y border-gray-200 overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Context</h4>
                                    <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Log ID:</span>
                                        <span className="font-mono font-medium">{log.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">IP Address:</span>
                                        <span className="font-mono font-medium">{log.ipAddress}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Request Context:</span>
                                        <span className="font-mono font-medium text-brand-600">{log.details.requestContext}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Session Token:</span>
                                        <span className="font-mono font-medium truncate max-w-[150px]">{log.details.sessionToken}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Changes</h4>
                                    <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm space-y-3 font-mono overflow-auto max-h-48">
                                      {log.details.oldValue && (
                                        <div>
                                          <div className="text-xs text-red-600 font-bold mb-1">- Old Value:</div>
                                          <div className="bg-red-50 text-red-800 p-2 rounded whitespace-pre-wrap">
                                            {log.details.oldValue}
                                          </div>
                                        </div>
                                      )}
                                      {log.details.newValue && (
                                        <div>
                                          <div className="text-xs text-emerald-600 font-bold mb-1">+ New Value:</div>
                                          <div className="bg-emerald-50 text-emerald-800 p-2 rounded whitespace-pre-wrap">
                                            {log.details.newValue}
                                          </div>
                                        </div>
                                      )}
                                      {!log.details.oldValue && !log.details.newValue && (
                                        <div className="text-gray-500 italic">No direct data modification</div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Integrity Hash</h4>
                                    <div className={`p-2 rounded-lg text-xs font-mono break-all border ${
                                      log.integrity === 'Verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                      {log.details.hmacSignature}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention Policy Display */}
      <div className="text-center pb-8 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Logs older than <span className="font-bold">7 years</span> are archived to cold storage in compliance with Ethiopian health data regulations.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Retention policy last reviewed: <span className="font-medium">November 10, 2023</span>. Satisfies Requirement 17.12.
        </p>
      </div>
    </div>
  );
}
