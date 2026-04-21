import React, { useState } from 'react';
import {
  FiFilter, FiDownload, FiSliders, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiClock, FiFileText,
} from 'react-icons/fi';
import './Reports.css';

// ── Demo data (used when backend isn't available) ──────────────────────────
const DEMO_EMPLOYEES = [
  { id: 1, name: 'Alex Johnson',    email: 'alex@company.com',   department: 'IT',          enrolled: '2026-01-15', module1: true,  module2: false, simPassed: false, simAttempted: true  },
  { id: 2, name: 'Sarah Chen',      email: 'sarah@company.com',  department: 'Engineering', enrolled: '2026-01-10', module1: true,  module2: true,  simPassed: true,  simAttempted: true  },
  { id: 3, name: 'Marcus Williams', email: 'marcus@company.com', department: 'Sales',       enrolled: '2026-01-12', module1: true,  module2: true,  simPassed: false, simAttempted: true  },
  { id: 4, name: 'Jordan Kim',      email: 'jordan@company.com', department: 'Finance',     enrolled: '2026-02-01', module1: false, module2: false, simPassed: false, simAttempted: false },
  { id: 5, name: 'Taylor Brooks',   email: 'taylor@company.com', department: 'Marketing',   enrolled: '2026-02-05', module1: true,  module2: false, simPassed: false, simAttempted: false },
  { id: 6, name: 'Chris Martinez',  email: 'chris@company.com',  department: 'Legal',       enrolled: '2026-01-20', module1: true,  module2: false, simPassed: false, simAttempted: true  },
  { id: 7, name: 'Dana Lee',        email: 'dana@company.com',   department: 'IT',          enrolled: '2026-02-10', module1: true,  module2: true,  simPassed: true,  simAttempted: true  },
  { id: 8, name: 'Morgan Patel',    email: 'morgan@company.com', department: 'Engineering', enrolled: '2026-03-01', module1: false, module2: false, simPassed: false, simAttempted: false },
  { id: 9, name: 'Riley Torres',    email: 'riley@company.com',  department: 'Sales',       enrolled: '2026-03-05', module1: true,  module2: true,  simPassed: true,  simAttempted: true  },
  { id: 10, name: 'Sam Nguyen',     email: 'sam@company.com',    department: 'Finance',     enrolled: '2026-03-10', module1: false, module2: false, simPassed: false, simAttempted: false },
];

const DEPARTMENTS = ['All Departments', 'IT', 'Engineering', 'Sales', 'Finance', 'Marketing', 'Legal'];

function getComplianceStatus(m1, m2, sim) {
  const count = [m1, m2, sim].filter(Boolean).length;
  if (count === 3) return 'compliant';
  if (count === 0) return 'non-compliant';
  return 'partial';
}

function buildDemoReport(filters) {
  const { department, startDate, endDate, status } = filters;
  const start = startDate ? new Date(startDate) : null;
  const end   = endDate   ? new Date(endDate + 'T23:59:59') : null;

  let rows = DEMO_EMPLOYEES.filter(e => {
    if (department && department !== 'All Departments' && e.department !== department) return false;
    const enrolled = new Date(e.enrolled);
    if (start && enrolled < start) return false;
    if (end   && enrolled > end)   return false;
    return true;
  }).map(e => ({
    ...e,
    complianceStatus: getComplianceStatus(e.module1, e.module2, e.simPassed),
  }));

  if (status !== 'all') rows = rows.filter(r => r.complianceStatus === status);
  return rows;
}

function StatusBadge({ status }) {
  if (status === 'compliant')     return <span className="comp-badge comp-green">● Compliant</span>;
  if (status === 'partial')       return <span className="comp-badge comp-yellow">● Partial</span>;
  if (status === 'non-compliant') return <span className="comp-badge comp-red">● Non-Compliant</span>;
  return null;
}

function ReqCell({ complete, attempted }) {
  if (complete) return <span className="req-cell req-pass"><FiCheckCircle /> Complete</span>;
  if (attempted) return <span className="req-cell req-fail"><FiXCircle /> Incomplete</span>;
  return <span className="req-cell req-pending"><FiClock /> Not Started</span>;
}

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    department: 'All Departments',
    startDate: yearAgo,
    endDate: today,
    status: 'all',
  });
  const [filterError, setFilterError]   = useState('');
  const [report, setReport]             = useState(null); // null = not generated yet
  const [loading, setLoading]           = useState(false);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const generateReport = async () => {
    setFilterError('');
    if (!filters.startDate || !filters.endDate) {
      setFilterError('Please select a start and end date.');
      return;
    }
    if (new Date(filters.startDate) > new Date(filters.endDate)) {
      setFilterError('Start date must be before end date.');
      return;
    }

    setLoading(true);
    let rows;
    try {
      const params = new URLSearchParams({
        department: filters.department === 'All Departments' ? '' : filters.department,
        startDate:  filters.startDate,
        endDate:    filters.endDate,
        status:     filters.status,
      });
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reports/compliance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        rows = data.employees.map(e => ({
          id:          e.id,
          name:        e.name,
          email:       e.email,
          department:  e.department,
          enrolled:    e.enrolled?.split('T')[0] || '—',
          module1:     e.module1.complete,
          module2:     e.module2.complete,
          simPassed:   e.simulation.passed,
          simAttempted: e.simulation.complete,
          complianceStatus: e.complianceStatus,
        }));
      } else {
        // fallback to demo data
        rows = buildDemoReport(filters);
      }
    } catch {
      rows = buildDemoReport(filters);
    }
    setLoading(false);

    setReport({
      rows,
      metadata: {
        department: filters.department,
        startDate:  filters.startDate,
        endDate:    filters.endDate,
        status:     filters.status,
        generatedAt: new Date().toLocaleString(),
      },
      summary: {
        total:        rows.length,
        compliant:    rows.filter(r => r.complianceStatus === 'compliant').length,
        partial:      rows.filter(r => r.complianceStatus === 'partial').length,
        nonCompliant: rows.filter(r => r.complianceStatus === 'non-compliant').length,
      },
    });
  };

  const adjustFilters = () => setReport(null); // 13A3

  const downloadPdf = () => window.print();

  // ── Filter panel ──────────────────────────────────────────────────────────
  const filterPanel = (
    <div className="report-filter-panel card no-print">
      <div className="report-filter-header">
        <h2><FiFilter /> Filter Options</h2>
        <p>Configure the parameters below then click Generate Report.</p>
      </div>

      <div className="report-filter-grid">
        <div className="form-group">
          <label>Department</label>
          <select value={filters.department} onChange={e => setFilter('department', e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Enrollment Date From</label>
          <input type="date" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Enrollment Date To</label>
          <input type="date" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Training Status</label>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="all">All Employees</option>
            <option value="compliant">Compliant Only</option>
            <option value="partial">Partially Compliant Only</option>
            <option value="non-compliant">Non-Compliant Only</option>
          </select>
        </div>
      </div>

      {filterError && <div className="report-filter-error"><FiAlertCircle /> {filterError}</div>}

      <button className="btn btn-primary report-gen-btn" onClick={generateReport} disabled={loading}>
        {loading ? 'Generating…' : <><FiFileText /> Generate Report</>}
      </button>
    </div>
  );

  // ── Report preview ────────────────────────────────────────────────────────
  return (
    <div className="reports-page">
      <div className="reports-header no-print">
        <div>
          <h1>Compliance Reports</h1>
          <p>Generate and download color-coded training compliance reports by department and date range.</p>
        </div>
      </div>

      {/* Show filters when no report, or the adjust-filters bar when report is showing */}
      {!report && filterPanel}

      {report && (
        <>
          {/* Adjust filters bar */}
          <div className="report-adjust-bar no-print">
            <button className="btn btn-outline" onClick={adjustFilters}>
              <FiSliders /> Adjust Filters
            </button>
            <span className="report-meta-note">
              {report.metadata.department} · {report.metadata.startDate} – {report.metadata.endDate}
              {report.metadata.status !== 'all' && ` · ${report.metadata.status}`}
            </span>
            <button className="btn btn-primary" onClick={downloadPdf}>
              <FiDownload /> Download PDF
            </button>
          </div>

          {/* Print header (only visible in print) */}
          <div className="print-header print-only">
            <div className="print-logo">🛡️ CyberShield — Compliance Report</div>
            <div className="print-meta">
              <span>Department: <strong>{report.metadata.department}</strong></span>
              <span>Period: <strong>{report.metadata.startDate} – {report.metadata.endDate}</strong></span>
              <span>Generated: <strong>{report.metadata.generatedAt}</strong></span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="report-summary-grid no-print">
            <div className="report-summary-card">
              <span className="summary-num">{report.summary.total}</span>
              <span className="summary-label">Total Employees</span>
            </div>
            <div className="report-summary-card green">
              <span className="summary-num">{report.summary.compliant}</span>
              <span className="summary-label">Compliant</span>
            </div>
            <div className="report-summary-card yellow">
              <span className="summary-num">{report.summary.partial}</span>
              <span className="summary-label">Partially Compliant</span>
            </div>
            <div className="report-summary-card red">
              <span className="summary-num">{report.summary.nonCompliant}</span>
              <span className="summary-label">Non-Compliant</span>
            </div>
          </div>

          {/* 7A1 — no results */}
          {report.rows.length === 0 ? (
            <div className="card report-empty no-print">
              <FiAlertCircle size={36} />
              <h3>No Records Found</h3>
              <p>No employee accounts match the selected department, date range, and status combination. Adjust your filters and try again.</p>
              <button className="btn btn-primary" onClick={adjustFilters}>Adjust Filters</button>
            </div>
          ) : (
            <div className="card report-table-card">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Enrolled</th>
                    <th>Phishing Awareness</th>
                    <th>Password Security</th>
                    <th>Phishing Simulation</th>
                    <th>Overall Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map(r => (
                    <tr key={r.id} className={`report-row comp-row-${r.complianceStatus}`}>
                      <td className="report-name-cell">
                        <div className="report-avatar">{r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div className="report-name">{r.name}</div>
                          <div className="report-email">{r.email}</div>
                        </div>
                      </td>
                      <td>{r.department}</td>
                      <td className="report-date">{r.enrolled}</td>
                      <td><ReqCell complete={r.module1} attempted={r.module1} /></td>
                      <td><ReqCell complete={r.module2} attempted={r.module2} /></td>
                      <td><ReqCell complete={r.simPassed} attempted={r.simAttempted} /></td>
                      <td><StatusBadge status={r.complianceStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom action bar */}
          {report.rows.length > 0 && (
            <div className="report-bottom-bar no-print">
              <button className="btn btn-outline" onClick={adjustFilters}>
                <FiSliders /> Adjust Filters
              </button>
              <button className="btn btn-primary" onClick={downloadPdf}>
                <FiDownload /> Download PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
