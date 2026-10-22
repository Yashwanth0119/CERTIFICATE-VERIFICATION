import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Building2,
  Calendar,
  Award,
  Layers,
  FileCheck,
  Trash2,
  Info,
  Check,
  X,
  Sparkles
} from 'lucide-react';

function AuthProofLogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagonal Cyber Shield */}
      <path
        d="M14 2.2L24.5 7.7V19.3L14 25.8L3.5 19.3V7.7L14 2.2Z"
        fill="#1F2329"
        stroke="#B6FF2E"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Precision Node Crosshairs */}
      <path
        d="M14 5.5V8M7.5 14H10M20.5 14H18M14 22.5V20"
        stroke="#B6FF2E"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Sharp Center Verification Mark */}
      <path
        d="M9.5 14L12.5 17L18.5 10.5"
        stroke="#B6FF2E"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  // Session & Authentication
  const [token, setToken] = useState(localStorage.getItem('cert_token') || null);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('cert_user') ? JSON.parse(localStorage.getItem('cert_user')) : null
  );

  // Login Form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Navigation (for HR: 'dashboard' | 'scanner' | 'submissions' | 'history')
  const [hrTab, setHrTab] = useState('dashboard');

  // Employee State
  const [employeeSubmissions, setEmployeeSubmissions] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({ total: 0, pending: 0, verified: 0, flagged: 0 });
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Web Development');
  const [uploadIssuer, setUploadIssuer] = useState('Example Technical Institute');
  const [uploadCertId, setUploadCertId] = useState('');
  const [uploadDate, setUploadDate] = useState('2025-08-15');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // HR State
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [hrStats, setHrStats] = useState({ total: 0, pending: 0, underReview: 0, verified: 0, flagged: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [verificationHistory, setVerificationHistory] = useState([]);

  // Scanner State
  const [scannerSource, setScannerSource] = useState('submission'); // 'submission' | 'direct'
  const [scannerSelectedSubmissionId, setScannerSelectedSubmissionId] = useState('');
  const [scannerDirectFile, setScannerDirectFile] = useState(null);
  const [scannerPreviewUrl, setScannerPreviewUrl] = useState('');
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerProgress, setScannerProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [hrDecisionInput, setHrDecisionInput] = useState('');
  const [hrNotesInput, setHrNotesInput] = useState('');
  const [decisionSaving, setDecisionSaving] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState('');

  // Demonstration Samples Modal
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [sampleList, setSampleList] = useState([]);

  // Load Demonstration Samples
  useEffect(() => {
    fetch('/api/samples/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSampleList(data.samples);
        }
      })
      .catch((err) => console.error('Error fetching sample list:', err));
  }, []);

  // Sync token to header requests
  const authHeaders = {
    Authorization: token ? `Bearer ${token}` : '',
  };

  // On mount or user change, load data
  useEffect(() => {
    if (token && currentUser) {
      if (currentUser.role === 'employee') {
        loadEmployeeData();
      } else if (currentUser.role === 'hr') {
        loadHrData();
      }
    }
  }, [token, currentUser]);

  // Load employee's own submissions
  const loadEmployeeData = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions', { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setEmployeeSubmissions(data.submissions || []);
        setEmployeeStats(data.stats || { total: 0, pending: 0, verified: 0, flagged: 0 });
      }
    } catch (err) {
      console.error('Error loading employee submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Load all submissions for HR
  const loadHrData = async () => {
    try {
      const subRes = await fetch('/api/submissions', { headers: authHeaders });
      const subData = await subRes.json();
      if (subData.success) {
        setAllSubmissions(subData.submissions || []);
        setHrStats(subData.stats || { total: 0, pending: 0, underReview: 0, verified: 0, flagged: 0 });
      }

      const histRes = await fetch('/api/verification/history', { headers: authHeaders });
      const histData = await histRes.json();
      if (histData.success) {
        setVerificationHistory(histData.verifications || []);
      }
    } catch (err) {
      console.error('Error loading HR data:', err);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Invalid username or password.');
        return;
      }

      // Store in state & storage
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('cert_token', data.token);
      localStorage.setItem('cert_user', JSON.stringify(data.user));

      // Reset login form
      setLoginUsername('');
      setLoginPassword('');
    } catch (err) {
      setLoginError('Server connection failed. Please ensure the backend is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders,
      });
    } catch (err) {
      console.warn('Logout notification failed:', err);
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('cert_token');
    localStorage.removeItem('cert_user');
    setSelectedSubmission(null);
    setScanResult(null);
  };

  // Handle Certificate Upload by Employee
  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!uploadFile) {
      setUploadError('Please select a certificate document file (PDF or image).');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('certificateFile', uploadFile);
    formData.append('certificateTitle', uploadTitle);
    formData.append('certificateType', uploadType);
    formData.append('issuingInstitution', uploadIssuer);
    formData.append('issueDate', uploadDate);
    if (uploadCertId) {
      formData.append('certificateId', uploadCertId);
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadError(data.message || 'Upload failed.');
        return;
      }

      setUploadSuccess('Certificate submitted successfully! Status set to Pending Verification.');
      setUploadTitle('');
      setUploadCertId('');
      setUploadFile(null);
      loadEmployeeData();

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess('');
      }, 1500);
    } catch (err) {
      setUploadError('Server communication error during file upload.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this certificate submission?')) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        if (currentUser.role === 'employee') {
          loadEmployeeData();
        } else {
          loadHrData();
        }
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission(null);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Scanner: select submission to scan
  const startScanForSubmission = (sub) => {
    setHrTab('scanner');
    setScannerSource('submission');
    setScannerSelectedSubmissionId(sub.id);
    setScannerPreviewUrl(`/api/submissions/${sub.id}/file`);
    setScanResult(null);
    setDecisionSuccess('');
  };

  // Scanner: Execute Scan
  const handleExecuteScan = async () => {
    setScannerLoading(true);
    setScannerProgress(15);
    setScanResult(null);
    setDecisionSuccess('');

    // Smooth scanning animation increments
    const interval = setInterval(() => {
      setScannerProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 250);

    const formData = new FormData();
    if (scannerSource === 'submission') {
      if (!scannerSelectedSubmissionId) {
        alert('Please select a submitted certificate to scan.');
        setScannerLoading(false);
        clearInterval(interval);
        return;
      }
      formData.append('submissionId', scannerSelectedSubmissionId);
    } else {
      if (!scannerDirectFile) {
        alert('Please select or drag-and-drop a certificate file to scan.');
        setScannerLoading(false);
        clearInterval(interval);
        return;
      }
      formData.append('directFile', scannerDirectFile);
    }

    try {
      const res = await fetch('/api/verification/scan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      clearInterval(interval);
      setScannerProgress(100);

      if (!res.ok || !data.success) {
        alert(data.message || 'Scanning failed.');
        setScannerLoading(false);
        return;
      }

      setScanResult(data.verification);
      setHrDecisionInput(data.verification.automatedResult);
      setHrNotesInput(data.verification.discrepancySummary || '');

      // Trigger celebratory confetti in Neon Lime and White if verified authentic
      if (data.verification.automatedResult === 'VERIFIED AS AUTHENTIC') {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#B6FF2E', '#C4FF54', '#FFFFFF', '#1F2329'],
        });
      }

      // Refresh HR data
      loadHrData();
    } catch (err) {
      alert('Error connecting to verification engine.');
    } finally {
      setTimeout(() => setScannerLoading(false), 400);
    }
  };

  // HR Record Decision
  const handleSaveDecision = async () => {
    if (!scanResult) return;
    setDecisionSaving(true);
    try {
      const res = await fetch(`/api/verification/${scanResult.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: hrDecisionInput,
          notes: hrNotesInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.verification);
        setDecisionSuccess('Decision officially recorded and synchronized with employee record.');
        loadHrData();
      }
    } catch (err) {
      alert('Failed to record decision.');
    } finally {
      setDecisionSaving(false);
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Verified as Authentic':
      case 'VERIFIED AS AUTHENTIC':
        return (
          <span className="badge badge-authentic">
            <CheckCircle2 size={13} />
            Verified Authentic
          </span>
        );
      case 'Flagged as Potentially Fake':
      case 'FLAGGED AS POTENTIALLY FAKE':
        return (
          <span className="badge badge-fake">
            <ShieldAlert size={13} />
            Flagged Fake
          </span>
        );
      case 'Under Review':
        return (
          <span className="badge badge-review">
            <RefreshCw size={13} className="spin" />
            Under Review
          </span>
        );
      case 'Verification Inconclusive':
      case 'VERIFICATION INCONCLUSIVE':
        return (
          <span className="badge badge-inconclusive">
            <AlertTriangle size={13} />
            Inconclusive
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            <Clock size={13} />
            Pending Verification
          </span>
        );
    }
  };

  // Filtered submissions for HR
  const filteredSubmissions = allSubmissions.filter((sub) => {
    const matchesSearch =
      sub.certificateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.issuingInstitution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesEmployee = employeeFilter === 'all' || sub.employeeUsername === employeeFilter;

    return matchesSearch && matchesStatus && matchesEmployee;
  });

  // If not logged in, render the full-screen immersive AuthProof login page
  if (!currentUser) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflowY: 'auto',
          zIndex: 999,
        }}
      >
        {/* Full-bleed wallpaper filling entire viewport */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />

        {/* Subtle atmospheric vignette */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(31, 35, 41, 0.2) 0%, rgba(21, 24, 29, 0.6) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Top-Left Floating Brand Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(31, 35, 41, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(182, 255, 46, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(182, 255, 46, 0.3)',
            }}
          >
            <AuthProofLogo size={26} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              AuthProof
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(182, 255, 46, 0.15)',
                color: '#B6FF2E',
                border: '1px solid rgba(182, 255, 46, 0.35)',
                letterSpacing: '0.04em',
              }}
            >
              VERIFICATION
            </span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div
          className="card"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '430px',
            padding: '38px 32px',
            background: 'rgba(31, 35, 41, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(182, 255, 46, 0.35)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(182, 255, 46, 0.15)',
            borderRadius: '20px',
          }}
        >
          {/* Login Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: '#1F2329',
                border: '2px solid rgba(182, 255, 46, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 28px rgba(182, 255, 46, 0.35)',
              }}
            >
              <AuthProofLogo size={38} />
            </div>
            <h1 style={{ fontSize: '1.625rem', marginBottom: '6px', letterSpacing: '-0.02em' }}>AuthProof</h1>
          </div>

          {/* Login Error Notification */}
          {loginError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 77, 77, 0.12)',
                border: '1px solid rgba(255, 77, 77, 0.35)',
                color: '#FFA3A3',
                fontSize: '0.84375rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={16} color="#FF4D4D" style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-username"
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <User
                  size={18}
                  color="#8E99A8"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter account password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                />
                <Lock
                  size={18}
                  color="#8E99A8"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#8E99A8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px' }}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <RefreshCw size={18} className="spin" color="#0F1216" />
                  <span>Authenticating credentials...</span>
                </>
              ) : (
                <>
                  <Shield size={18} color="#0F1216" />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <header
        style={{
          background: 'rgba(31, 35, 41, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(182, 255, 46, 0.18)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#1F2329',
                border: '1.5px solid rgba(182, 255, 46, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(182, 255, 46, 0.35)',
              }}
            >
              <AuthProofLogo size={26} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                AuthProof
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(182, 255, 46, 0.15)',
                  color: '#B6FF2E',
                  border: '1px solid rgba(182, 255, 46, 0.35)',
                  letterSpacing: '0.04em',
                }}
              >
                VERIFICATION
              </span>
            </div>
          </div>

          {/* Right Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* User Profile Bar when Logged In */}
            {currentUser && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '4px 6px 4px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {currentUser.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: currentUser.role === 'hr' ? 'rgba(182, 255, 46, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: currentUser.role === 'hr' ? '#B6FF2E' : '#FFFFFF',
                        textTransform: 'uppercase',
                        border: currentUser.role === 'hr' ? '1px solid rgba(182, 255, 46, 0.4)' : 'none',
                      }}
                    >
                      {currentUser.role === 'hr' ? 'HR ADMIN' : 'EMPLOYEE'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {currentUser.department}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  title="Sign out of your session"
                  style={{ padding: '6px 10px' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
        {currentUser.role === 'employee' ? (
          /* ============================================================== */
          /* 2. EMPLOYEE PORTAL (For Employee 1 and Employee 2)             */
          /* ============================================================== */
          <div>
            {/* Employee Welcome & Action Bar */}
            <div
              className="card"
              style={{
                marginBottom: '24px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                background: 'linear-gradient(135deg, #1F2329 0%, #171A1F 100%)',
              }}
            >
              <div>
                <h1 style={{ fontSize: '1.625rem', marginBottom: '6px' }}>
                  Welcome back, {currentUser.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Manage your academic & professional credentials. HR verification updates reflect here in real-time.
                </p>
              </div>

              <button
                id="btn-upload-certificate"
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary btn-lg"
              >
                <Upload size={18} color="#0F1216" />
                <span>Upload Certificate</span>
              </button>
            </div>

            {/* Employee Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    TOTAL SUBMITTED
                  </span>
                  <FileText size={18} color="#B6FF2E" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {employeeStats.total}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  All submitted qualifications
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    PENDING VERIFICATION
                  </span>
                  <Clock size={18} color="#A0ACB9" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#CBD5E1' }}>
                  {employeeStats.pending}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Awaiting HR scanning review
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    VERIFIED AUTHENTIC
                  </span>
                  <CheckCircle2 size={18} color="#B6FF2E" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#B6FF2E' }}>
                  {employeeStats.verified}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Confirmed via institutional registry
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    FLAGGED / CONCERNS
                  </span>
                  <ShieldAlert size={18} color="#FF4D4D" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FF6B6B' }}>
                  {employeeStats.flagged}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Discrepancy detected during scan
                </p>
              </div>
            </div>

            {/* Employee Submissions Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>Your Submission History</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Personal records stored securely in application repository. Only visible to you and HR.
                  </p>
                </div>
                <button
                  onClick={loadEmployeeData}
                  className="btn btn-secondary btn-sm"
                  title="Refresh records"
                >
                  <RefreshCw size={14} className={loadingSubmissions ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Certificate ID</th>
                      <th>Title & Type</th>
                      <th>Issuing Institution</th>
                      <th>Issue Date</th>
                      <th>Submitted On</th>
                      <th>Verification Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px' }}>
                          <Award size={36} color="#6E7A8A" style={{ marginBottom: '12px', display: 'inline-block' }} />
                          <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '4px' }}>
                            No certificates uploaded yet
                          </h3>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Submit your certificate files for HR authenticity verification.
                          </p>
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn btn-primary btn-sm"
                          >
                            <Upload size={14} color="#0F1216" />
                            <span>Upload Your First Certificate</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      employeeSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#B6FF2E' }}>
                              {sub.certificateId}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{sub.certificateTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.certificateType}</div>
                          </td>
                          <td>{sub.issuingInstitution}</td>
                          <td>{sub.issueDate}</td>
                          <td>{new Date(sub.submissionDate).toLocaleDateString()}</td>
                          <td>{renderStatusBadge(sub.status)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => setSelectedSubmission(sub)}
                                className="btn btn-secondary btn-sm"
                                title="View submission details"
                              >
                                View Details
                              </button>
                              {sub.status === 'Pending Verification' && (
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Cancel submission"
                                  style={{ padding: '6px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 3. HR ADMINISTRATOR PORTAL                                     */
          /* ============================================================== */
          <div>
            {/* HR Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '12px',
              }}
            >
              <button
                onClick={() => setHrTab('dashboard')}
                className={`btn ${hrTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={16} color={hrTab === 'dashboard' ? '#0F1216' : 'currentColor'} />
                <span>HR Dashboard</span>
              </button>
              <button
                id="nav-scanner-tab"
                onClick={() => setHrTab('scanner')}
                className={`btn ${hrTab === 'scanner' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ShieldCheck size={16} color={hrTab === 'scanner' ? '#0F1216' : 'currentColor'} />
                <span>Certificate Verification (Scanner)</span>
              </button>
              <button
                onClick={() => setHrTab('submissions')}
                className={`btn ${hrTab === 'submissions' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileCheck size={16} color={hrTab === 'submissions' ? '#0F1216' : 'currentColor'} />
                <span>All Submissions ({allSubmissions.length})</span>
              </button>
              <button
                onClick={() => setHrTab('history')}
                className={`btn ${hrTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Clock size={16} color={hrTab === 'history' ? '#0F1216' : 'currentColor'} />
                <span>Verification History</span>
              </button>
            </div>

            {/* TAB 1: HR DASHBOARD */}
            {hrTab === 'dashboard' && (
              <div>
                {/* HR Stat Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px',
                  }}
                >
                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        TOTAL RECEIVED
                      </span>
                      <FileText size={18} color="#B6FF2E" />
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {hrStats.total}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      From Employee 1 & Employee 2
                    </p>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        PENDING SCAN
                      </span>
                      <Clock size={18} color="#FFC033" />
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFC033' }}>
                      {hrStats.pending}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ready for forensic analysis
                    </p>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        VERIFIED AUTHENTIC
                      </span>
                      <CheckCircle2 size={18} color="#B6FF2E" />
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#B6FF2E' }}>
                      {hrStats.verified}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Accredited registry matches
                    </p>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        FLAGGED AS FAKE
                      </span>
                      <ShieldAlert size={18} color="#FF4D4D" />
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FF6B6B' }}>
                      {hrStats.flagged}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Anomalies & identity mismatches
                    </p>
                  </div>
                </div>

                {/* Recent Submissions from Employees */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
                  <div
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>
                        Recent Employee Submissions
                      </h2>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Live queue of certificates submitted by employees awaiting verification.
                      </p>
                    </div>
                    <button
                      onClick={() => setHrTab('scanner')}
                      className="btn btn-primary btn-sm"
                    >
                      <ShieldCheck size={14} color="#0F1216" />
                      <span>Open Scanner</span>
                    </button>
                  </div>

                  <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Certificate ID</th>
                          <th>Employee</th>
                          <th>Certificate Title</th>
                          <th>Issuing Institution</th>
                          <th>Submitted On</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                              No employee submissions received yet. Have Employee 1 or Employee 2 upload a certificate.
                            </td>
                          </tr>
                        ) : (
                          allSubmissions.slice(0, 5).map((sub) => (
                            <tr key={sub.id}>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#B6FF2E' }}>
                                  {sub.certificateId}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{sub.employeeName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{sub.employeeUsername}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{sub.certificateTitle}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.certificateType}</div>
                              </td>
                              <td>{sub.issuingInstitution}</td>
                              <td>{new Date(sub.submissionDate).toLocaleDateString()}</td>
                              <td>{renderStatusBadge(sub.status)}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    onClick={() => setSelectedSubmission(sub)}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => startScanForSubmission(sub)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    <ShieldCheck size={14} color="#0F1216" />
                                    <span>Verify</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CERTIFICATE VERIFICATION SCANNER */}
            {hrTab === 'scanner' && (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: scanResult ? '1fr 1fr' : '1fr',
                    gap: '24px',
                    alignItems: 'start',
                  }}
                >
                  {/* Left Column: Scanner Interface */}
                  <div className="card">
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(182, 255, 46, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ShieldCheck size={20} color="#B6FF2E" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem' }}>Forensic Verification Scanner</h2>
                      </div>
                      <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)' }}>
                        Select an employee submission from the queue or upload a standalone document to execute deep registry matching.
                      </p>
                    </div>

                    {/* Source Selector (Submission vs Direct Upload) */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        background: '#171A1F',
                        padding: '6px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <button
                        onClick={() => {
                          setScannerSource('submission');
                          setScanResult(null);
                        }}
                        style={{
                          background: scannerSource === 'submission' ? '#2A303A' : 'transparent',
                          color: scannerSource === 'submission' ? '#B6FF2E' : 'var(--text-muted)',
                          border: scannerSource === 'submission' ? '1px solid rgba(182, 255, 46, 0.4)' : 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <FileCheck size={16} />
                        <span>Select Employee Submission</span>
                      </button>

                      <button
                        onClick={() => {
                          setScannerSource('direct');
                          setScanResult(null);
                        }}
                        style={{
                          background: scannerSource === 'direct' ? '#2A303A' : 'transparent',
                          color: scannerSource === 'direct' ? '#B6FF2E' : 'var(--text-muted)',
                          border: scannerSource === 'direct' ? '1px solid rgba(182, 255, 46, 0.4)' : 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={16} />
                        <span>Direct File Upload</span>
                      </button>
                    </div>

                    {/* Source A: Submission Dropdown */}
                    {scannerSource === 'submission' ? (
                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label" htmlFor="scanner-submission-select">
                          Select Certificate Submission
                        </label>
                        <select
                          id="scanner-submission-select"
                          className="form-select"
                          value={scannerSelectedSubmissionId}
                          onChange={(e) => {
                            setScannerSelectedSubmissionId(e.target.value);
                            if (e.target.value) {
                              setScannerPreviewUrl(`/api/submissions/${e.target.value}/file`);
                            } else {
                              setScannerPreviewUrl('');
                            }
                            setScanResult(null);
                          }}
                        >
                          <option value="">-- Choose submitted certificate --</option>
                          {allSubmissions.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              [{sub.certificateId}] {sub.employeeName} — {sub.certificateTitle} ({sub.status})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      /* Source B: Direct File Drop Area */
                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">
                          Upload Certificate File (PDF / Image)
                        </label>
                        <div
                          style={{
                            border: '2px dashed rgba(182, 255, 46, 0.3)',
                            borderRadius: '12px',
                            padding: '28px 20px',
                            textAlign: 'center',
                            background: '#171A1F',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                          }}
                          onClick={() => document.getElementById('direct-file-input').click()}
                        >
                          <Upload size={32} color="#B6FF2E" style={{ marginBottom: '8px', display: 'inline-block' }} />
                          <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                            {scannerDirectFile ? scannerDirectFile.name : 'Click to select or drop certificate file'}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Supports PDF, JPG, JPEG, and PNG files up to 15MB
                          </p>
                          <input
                            id="direct-file-input"
                            type="file"
                            accept=".pdf,image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setScannerDirectFile(file);
                                setScannerPreviewUrl(URL.createObjectURL(file));
                                setScanResult(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Certificate Preview Frame with Laser Scanner Animation */}
                    <div
                      style={{
                        position: 'relative',
                        height: '340px',
                        background: '#111418',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Laser Line when Scanning */}
                      {scannerLoading && <div className="scanner-laser" />}

                      {scannerPreviewUrl ? (
                        <iframe
                          src={scannerPreviewUrl}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: '#FFFFFF',
                          }}
                          title="Certificate Document Preview"
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Award size={48} color="#333A44" style={{ marginBottom: '12px', display: 'inline-block' }} />
                          <p style={{ fontSize: '0.875rem' }}>Select or upload a certificate to preview document</p>
                        </div>
                      )}
                    </div>

                    {/* Scanning Progress Bar */}
                    {scannerLoading && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                          <span style={{ color: '#B6FF2E', fontWeight: 700 }}>Executing forensic multi-layer scan...</span>
                          <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{scannerProgress}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#2A303A', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${scannerProgress}%`,
                              background: '#B6FF2E',
                              boxShadow: '0 0 10px #B6FF2E',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Scan Action Button */}
                    <button
                      id="btn-scan-certificate"
                      onClick={handleExecuteScan}
                      disabled={scannerLoading || (!scannerSelectedSubmissionId && !scannerDirectFile)}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                    >
                      {scannerLoading ? (
                        <>
                          <RefreshCw size={18} className="spin" color="#0F1216" />
                          <span>Scanning Document & Verifying Registry...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} color="#0F1216" />
                          <span>Scan Certificate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column: Verification Result Panel */}
                  {scanResult && (
                    <div className="card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                      {/* Result Header & Verdict Banner */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '1.125rem' }}>Forensic Verification Verdict</h3>
                          <a
                            href={`/api/verification/${scanResult.id}/report`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            download
                          >
                            <Download size={14} color="#B6FF2E" />
                            <span>Download PDF Report</span>
                          </a>
                        </div>

                        {/* Large Status Badge */}
                        <div
                          style={{
                            padding: '18px 20px',
                            borderRadius: '12px',
                            background:
                              scanResult.automatedResult === 'VERIFIED AS AUTHENTIC'
                                ? 'rgba(182, 255, 46, 0.12)'
                                : scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                ? 'rgba(255, 77, 77, 0.14)'
                                : 'rgba(255, 184, 0, 0.14)',
                            border: `1.5px solid ${
                              scanResult.automatedResult === 'VERIFIED AS AUTHENTIC'
                                ? '#B6FF2E'
                                : scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                ? '#FF4D4D'
                                : '#FFB800'
                            }`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                          }}
                        >
                          {scanResult.automatedResult === 'VERIFIED AS AUTHENTIC' ? (
                            <CheckCircle2 size={32} color="#B6FF2E" />
                          ) : scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE' ? (
                            <ShieldAlert size={32} color="#FF4D4D" />
                          ) : (
                            <AlertTriangle size={32} color="#FFB800" />
                          )}

                          <div>
                            <div
                              style={{
                                fontSize: '1.1875rem',
                                fontWeight: 800,
                                color:
                                  scanResult.automatedResult === 'VERIFIED AS AUTHENTIC'
                                    ? '#B6FF2E'
                                    : scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                    ? '#FFA3A3'
                                    : '#FFD166',
                              }}
                            >
                              {scanResult.automatedResult}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              Confidence Score: {scanResult.confidenceScore}% • Checks Passed: {scanResult.checksPassed}/
                              {(scanResult.checksPassed || 0) + (scanResult.checksFailed || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Discrepancy Box if Flagged */}
                      {scanResult.discrepancySummary && (
                        <div
                          style={{
                            padding: '14px 16px',
                            borderRadius: '10px',
                            background:
                              scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                ? 'rgba(255, 77, 77, 0.1)'
                                : '#171A1F',
                            border: `1px solid ${
                              scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                ? 'rgba(255, 77, 77, 0.35)'
                                : 'rgba(182, 255, 46, 0.2)'
                            }`,
                            marginBottom: '20px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color:
                                scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                                  ? '#FFA3A3'
                                  : '#B6FF2E',
                              marginBottom: '4px',
                            }}
                          >
                            {scanResult.automatedResult === 'FLAGGED AS POTENTIALLY FAKE'
                              ? 'CRITICAL DISCREPANCY DETECTED'
                              : 'REGISTRY MATCH DETAILS'}
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', margin: 0 }}>
                            {scanResult.discrepancySummary}
                          </p>
                        </div>
                      )}

                      {/* Extracted Certificate Fields */}
                      <div
                        style={{
                          background: '#171A1F',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          padding: '16px',
                          marginBottom: '20px',
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
                          EXTRACTED CREDENTIAL METADATA
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Certificate ID:</span>
                            <div style={{ fontWeight: 700, color: '#B6FF2E', fontFamily: 'var(--font-mono)' }}>
                              {scanResult.certificateId || scanResult.extractedData?.certificateId || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Recipient Name:</span>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>
                              {scanResult.recipientName || scanResult.extractedData?.recipientName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Issuing Institution:</span>
                            <div style={{ fontWeight: 600, color: '#CBD5E1' }}>
                              {scanResult.issuingInstitution || scanResult.extractedData?.issuingInstitution || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Program / Type:</span>
                            <div style={{ fontWeight: 600, color: '#CBD5E1' }}>
                              {scanResult.certificateType || scanResult.extractedData?.certificateType || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Layered Checks Accordion/List */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                          FORENSIC INSPECTION CRITERIA
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(scanResult.checks || []).map((chk, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: chk.passed ? 'rgba(182, 255, 46, 0.08)' : 'rgba(255, 77, 77, 0.08)',
                                border: `1px solid ${chk.passed ? 'rgba(182, 255, 46, 0.25)' : 'rgba(255, 77, 77, 0.25)'}`,
                              }}
                            >
                              <div style={{ marginTop: '2px' }}>
                                {chk.passed ? (
                                  <CheckCircle2 size={16} color="#B6FF2E" />
                                ) : (
                                  <ShieldAlert size={16} color="#FF4D4D" />
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                                  {chk.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {chk.details}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* HR Decision & Review Sign-off */}
                      <div
                        style={{
                          padding: '18px',
                          borderRadius: '12px',
                          background: '#1F2329',
                          border: '1px solid var(--border-card)',
                        }}
                      >
                        <h4 style={{ fontSize: '0.9375rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileCheck size={16} color="#B6FF2E" />
                          <span>HR Official Decision & Sign-off</span>
                        </h4>

                        {decisionSuccess && (
                          <div
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'rgba(182, 255, 46, 0.15)',
                              border: '1px solid rgba(182, 255, 46, 0.3)',
                              color: '#B6FF2E',
                              fontSize: '0.8125rem',
                              marginBottom: '12px',
                            }}
                          >
                            ✓ {decisionSuccess}
                          </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <label className="form-label">Final Verification Decision</label>
                          <select
                            className="form-select"
                            value={hrDecisionInput}
                            onChange={(e) => setHrDecisionInput(e.target.value)}
                          >
                            <option value="VERIFIED AS AUTHENTIC">VERIFIED AS AUTHENTIC</option>
                            <option value="FLAGGED AS POTENTIALLY FAKE">FLAGGED AS POTENTIALLY FAKE</option>
                            <option value="VERIFICATION INCONCLUSIVE">VERIFICATION INCONCLUSIVE</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label className="form-label">HR Review Notes</label>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            placeholder="Add compliance notes or institutional explanation..."
                            value={hrNotesInput}
                            onChange={(e) => setHrNotesInput(e.target.value)}
                          />
                        </div>

                        <button
                          onClick={handleSaveDecision}
                          disabled={decisionSaving}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                        >
                          {decisionSaving ? (
                            <>
                              <RefreshCw size={14} className="spin" color="#0F1216" />
                              <span>Saving Decision...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} color="#0F1216" />
                              <span>Confirm & Synchronize Verification Status</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ALL SUBMISSIONS (With Search, Filter & Sort) */}
            {hrTab === 'submissions' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>All Employee Submissions</h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Search and manage submissions from Employee 1 and Employee 2 across all departments.
                    </p>
                  </div>

                  {/* Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search ID, title, employee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '34px', width: '220px', padding: '8px 12px 8px 34px', fontSize: '0.8125rem' }}
                      />
                      <Search
                        size={15}
                        color="#8E99A8"
                        style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.8125rem', width: '160px' }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending Verification">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified as Authentic">Verified</option>
                      <option value="Flagged as Potentially Fake">Flagged Fake</option>
                    </select>

                    {/* Employee Filter */}
                    <select
                      className="form-select"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.8125rem', width: '160px' }}
                    >
                      <option value="all">All Employees</option>
                      <option value="employee1">Employee 1 (Arjun)</option>
                      <option value="employee2">Employee 2 (Priya)</option>
                    </select>

                    <button onClick={loadHrData} className="btn btn-secondary btn-sm" title="Refresh">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Certificate ID</th>
                        <th>Submitting Employee</th>
                        <th>Title & Type</th>
                        <th>Issuing Institution</th>
                        <th>Submission Date</th>
                        <th>Verification Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No submissions match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((sub) => (
                          <tr key={sub.id}>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#B6FF2E' }}>
                                {sub.certificateId}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{sub.employeeName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {sub.employeeDepartment}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{sub.certificateTitle}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {sub.certificateType}
                              </div>
                            </td>
                            <td>{sub.issuingInstitution}</td>
                            <td>{new Date(sub.submissionDate).toLocaleDateString()}</td>
                            <td>{renderStatusBadge(sub.status)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="btn btn-secondary btn-sm"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => startScanForSubmission(sub)}
                                  className="btn btn-primary btn-sm"
                                >
                                  <ShieldCheck size={14} color="#0F1216" />
                                  <span>Verify</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete submission"
                                  style={{ padding: '6px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: VERIFICATION HISTORY */}
            {hrTab === 'history' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>Official Verification Audit Trail</h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Complete immutable history of forensic scans, confidence scores, and recorded HR decisions.
                    </p>
                  </div>
                  <button onClick={loadHrData} className="btn btn-secondary btn-sm">
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Scan Date & Time</th>
                        <th>Certificate ID</th>
                        <th>Associated Employee</th>
                        <th>Automated Verdict</th>
                        <th>Score</th>
                        <th>HR Review Decision</th>
                        <th style={{ textAlign: 'right' }}>Official Audit Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No verification scans executed yet.
                          </td>
                        </tr>
                      ) : (
                        verificationHistory.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontSize: '0.8125rem' }}>
                              {new Date(item.timestamp).toLocaleString()}
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#B6FF2E' }}>
                                {item.certificateId}
                              </span>
                            </td>
                            <td>
                              {item.employeeName ? (
                                <>
                                  <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.employeeName}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{item.employeeUsername}</div>
                                </>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Direct Scan (Standalone)</span>
                              )}
                            </td>
                            <td>{renderStatusBadge(item.automatedResult)}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: item.confidenceScore > 80 ? '#B6FF2E' : '#FF6B6B' }}>
                                {item.confidenceScore}%
                              </span>
                            </td>
                            <td>
                              {item.hrDecision ? (
                                renderStatusBadge(item.hrDecision)
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Awaiting Sign-off</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <a
                                href={`/api/verification/${item.id}/report`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm"
                                download
                              >
                                <Download size={13} color="#B6FF2E" />
                                <span>PDF Report</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: UPLOAD CERTIFICATE (For Employee)                     */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={20} color="#B6FF2E" />
                <h3 style={{ fontSize: '1.25rem' }}>Submit Certificate for Verification</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8E99A8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCertificateUpload}>
              <div className="modal-body">
                {uploadError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 77, 77, 0.12)',
                      border: '1px solid rgba(255, 77, 77, 0.35)',
                      color: '#FFA3A3',
                      fontSize: '0.84375rem',
                      marginBottom: '16px',
                    }}
                  >
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(182, 255, 46, 0.14)',
                      border: '1px solid rgba(182, 255, 46, 0.35)',
                      color: '#B6FF2E',
                      fontSize: '0.84375rem',
                      marginBottom: '16px',
                    }}
                  >
                    ✓ {uploadSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="upload-title">Certificate Title *</label>
                  <input
                    id="upload-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Certified Full Stack Web Specialist"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="upload-type">Certificate Type *</label>
                    <select
                      id="upload-type"
                      className="form-select"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      required
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Cybersecurity Fundamentals">Cybersecurity Fundamentals</option>
                      <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Project Management">Project Management</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="upload-certid">Certificate ID (If known)</label>
                    <input
                      id="upload-certid"
                      type="text"
                      className="form-input"
                      placeholder="e.g. DEMO-CERT-1001"
                      value={uploadCertId}
                      onChange={(e) => setUploadCertId(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="upload-issuer">Issuing Institution *</label>
                    <input
                      id="upload-issuer"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Example Technical Institute"
                      value={uploadIssuer}
                      onChange={(e) => setUploadIssuer(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="upload-date">Issue Date</label>
                    <input
                      id="upload-date"
                      type="date"
                      className="form-input"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Certificate Document File * (PDF, JPG, JPEG, PNG)</label>
                  <div
                    style={{
                      border: '2px dashed rgba(182, 255, 46, 0.3)',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      background: '#171A1F',
                      cursor: 'pointer',
                    }}
                    onClick={() => document.getElementById('employee-cert-file').click()}
                  >
                    <Upload size={28} color="#B6FF2E" style={{ marginBottom: '8px', display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {uploadFile ? uploadFile.name : 'Click to select or drag & drop certificate document'}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Accepted formats: PDF, JPG, PNG (Max size: 15MB)
                    </p>
                    <input
                      id="employee-cert-file"
                      type="file"
                      accept=".pdf,image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="btn btn-primary btn-sm"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw size={14} className="spin" color="#0F1216" />
                      <span>Submitting File...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} color="#0F1216" />
                      <span>Submit Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SUBMISSION DETAILS VIEW                               */}
      {/* ============================================================== */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} color="#B6FF2E" />
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Certificate Submission Details</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ID: {selectedSubmission.certificateId} • Submitted by {selectedSubmission.employeeName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'transparent', border: 'none', color: '#8E99A8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
                {/* Document Preview Pane */}
                <div
                  style={{
                    height: '420px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    background: '#111418',
                  }}
                >
                  <iframe
                    src={`/api/submissions/${selectedSubmission.id}/file`}
                    style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
                    title="Certificate Preview"
                  />
                </div>

                {/* Details & Verification Status */}
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</span>
                    <div style={{ marginTop: '4px' }}>{renderStatusBadge(selectedSubmission.status)}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84375rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Certificate Title:</span>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{selectedSubmission.certificateTitle}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Certificate Type:</span>
                      <div style={{ fontWeight: 600, color: '#CBD5E1' }}>{selectedSubmission.certificateType}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Issuing Institution:</span>
                      <div style={{ fontWeight: 600, color: '#CBD5E1' }}>{selectedSubmission.issuingInstitution}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Issue Date:</span>
                      <div style={{ fontWeight: 600, color: '#CBD5E1' }}>{selectedSubmission.issueDate}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Original Filename:</span>
                      <div style={{ fontWeight: 600, color: '#CBD5E1', wordBreak: 'break-all' }}>
                        {selectedSubmission.originalFilename}
                      </div>
                    </div>
                  </div>

                  {/* Verification Summary if completed */}
                  {selectedSubmission.verificationSummary && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#171A1F',
                        border: '1px solid rgba(182, 255, 46, 0.25)',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B6FF2E', marginBottom: '4px' }}>
                        VERIFICATION SUMMARY
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', margin: 0 }}>
                        {selectedSubmission.verificationSummary}
                      </p>
                    </div>
                  )}

                  {/* PDF Report Download if available */}
                  {selectedSubmission.verificationId && (
                    <div style={{ marginTop: '18px' }}>
                      <a
                        href={`/api/verification/${selectedSubmission.verificationId}/report`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        download
                      >
                        <Download size={14} color="#B6FF2E" />
                        <span>Download Official Verification Audit Report (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {currentUser.role === 'hr' && (
                <button
                  onClick={() => {
                    const sub = selectedSubmission;
                    setSelectedSubmission(null);
                    startScanForSubmission(sub);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <ShieldCheck size={14} color="#0F1216" />
                  <span>Verify in Scanner</span>
                </button>
              )}
              <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
