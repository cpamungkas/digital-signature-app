import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Search,
  Filter,
} from 'lucide-react';
import useAuthStore from '../lib/auth';
import api from '../lib/api';
import DocumentCard from '../components/DocumentCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    signed: 0,
    draft: 0,
  });

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await api.get('/documents', { params });
      const docs = data.data?.documents || [];
      setDocuments(docs);
      setStats({
        total: data.data?.pagination?.total || docs.length,
        pending: docs.filter((d) => d.status === 'pending').length,
        signed: docs.filter((d) => d.status === 'signed').length,
        draft: docs.filter((d) => d.status === 'draft').length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents.');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSign = (docId) => {
    navigate(`/documents/${docId}/sign`);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const title = prompt('Document title:', file.name.replace('.pdf', ''));
      if (!title) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fetchDocuments();
      } catch (err) {
        alert(err.response?.data?.message || 'Upload failed.');
      }
    };
    input.click();
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card">
      <div className="card-body flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.fullName || user?.email || 'User'}
          </p>
        </div>
        <button onClick={handleUpload} className="btn-primary flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total Documents" value={stats.total} color="bg-primary-600" />
        <StatCard icon={Clock} label="Draft" value={stats.draft} color="bg-yellow-500" />
        <StatCard icon={AlertCircle} label="Pending" value={stats.pending} color="bg-orange-500" />
        <StatCard icon={CheckCircle} label="Signed" value={stats.signed} color="bg-green-500" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-36"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && !error && (
        <>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="h-16 w-16 mb-3" />
              <p className="text-lg font-medium">No documents yet</p>
              <p className="text-sm mt-1">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onSign={handleSign} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
