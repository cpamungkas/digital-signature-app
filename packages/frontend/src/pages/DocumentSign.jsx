import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import SignatureCanvas from '../components/SignatureCanvas';

export default function DocumentSign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchDocument = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/documents/${id}`);
      setDocument(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleSign = async () => {
    if (!signatureData) {
      alert('Please draw your signature first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/documents/${id}/sign`, {
        signatureImage: signatureData,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sign document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="card p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Error loading document</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button onClick={fetchDocument} className="btn-primary mt-4">
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Document Signed!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your signature has been applied successfully.
          </p>
          <div className="mt-6 space-x-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sign Document</h1>
            <p className="text-sm text-gray-500">
              Review and digitally sign this document
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Document preview */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {document?.title || 'Document'}
                  </h3>
                  {document?.fileName && (
                    <p className="text-sm text-gray-500">{document.fileName}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body">
              {document && (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Status</span>
                    <span className="font-medium capitalize">{document.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Uploaded</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                  {document.fileSize && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-400">Size</span>
                      <span>
                        {(document.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                  {document.description && (
                    <div>
                      <p className="text-gray-400 mb-1">Description</p>
                      <p>{document.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signature panel */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Your Signature</h3>
              <p className="text-sm text-gray-500">
                Draw your signature using mouse or touch
              </p>
            </div>
            <div className="card-body space-y-4">
              <SignatureCanvas onSave={setSignatureData} width={400} height={180} />

              {signatureData && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Signature captured
                  </p>
                  <img
                    src={signatureData}
                    alt="Your signature preview"
                    className="mt-2 h-12 object-contain bg-white rounded"
                  />
                </div>
              )}

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    By signing, you agree to the terms and conditions of this document. This
                    electronic signature is legally binding.
                  </p>
                </div>

                <button
                  onClick={handleSign}
                  disabled={isSubmitting || !signatureData}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing...
                    </span>
                  ) : (
                    'Sign Document'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
