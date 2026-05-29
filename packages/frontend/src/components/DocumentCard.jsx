import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function DocumentCard({ document, onSign }) {
  const config = statusConfig[document.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{document.title}</h3>
              {document.fileName && (
                <p className="mt-0.5 text-sm text-gray-500">{document.fileName}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>{formatSize(document.fileSize)}</span>
                <span>{formatDate(document.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
        </div>

        {document.signers && document.signers.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Signers</p>
            <div className="flex flex-wrap gap-2">
              {document.signers.map((signer) => (
                <div
                  key={signer.id}
                  className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                >
                  <div className="h-4 w-4 rounded-full bg-gray-300" />
                  <span>{signer.signer?.fullName || signer.signer?.email || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {document.status === 'pending' && onSign && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <button
              onClick={() => onSign(document.id)}
              className="btn-primary w-full text-sm"
            >
              Sign Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
