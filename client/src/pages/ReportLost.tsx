import { useState, useContext, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Books', 'Keys', 'Other'];

const ReportLost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    brand: '',
    color: '',
    description: '',
    location: '',
    dateLostOrFound: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!user) return <Navigate to="/login" />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image must be under 5MB.');
      return;
    }
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((cur) => ({ ...cur, imageUrl: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview('');
    setImageFileName('');
    setFormData((cur) => ({ ...cur, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/items', { ...formData, type: 'LOST' });
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Report a Lost Item</h1>
        <p className="text-gray-500 mt-1">Fill in as many details as possible to help others identify your item.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{submitError}</div>
          )}

          <div>
            <label htmlFor="rl-title" className="block text-sm font-semibold text-gray-700 mb-1">Item Title <span className="text-red-500">*</span></label>
            <input
              id="rl-title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              placeholder="e.g., MacBook Air M2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rl-category" className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                id="rl-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rl-brand" className="block text-sm font-semibold text-gray-700 mb-1">Brand / Make</label>
              <input
                id="rl-brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                placeholder="e.g., Apple"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rl-color" className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
              <input
                id="rl-color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                placeholder="e.g., Silver"
              />
            </div>
            <div>
              <label htmlFor="rl-location" className="block text-sm font-semibold text-gray-700 mb-1">Location Lost <span className="text-red-500">*</span></label>
              <input
                id="rl-location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                placeholder="e.g., Main Library"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rl-date" className="block text-sm font-semibold text-gray-700 mb-1">Date Lost <span className="text-red-500">*</span></label>
            <input
              id="rl-date"
              type="date"
              name="dateLostOrFound"
              required
              value={formData.dateLostOrFound}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="rl-desc" className="block text-sm font-semibold text-gray-700 mb-1">Description &amp; Distinguishing Features <span className="text-red-500">*</span></label>
            <textarea
              id="rl-desc"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm h-28 focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
              placeholder="e.g., Has a NASA sticker on the front, dent on bottom-left corner, name written inside…"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Item Photo (optional)</label>
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
              >
                <span className="text-2xl mb-1">📷</span>
                <p className="text-sm text-gray-500">Click to upload a photo</p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP — max 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Item preview" className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 flex items-center justify-between px-3 py-2">
                  <p className="text-white text-xs truncate max-w-[80%]">{imageFileName}</p>
                  <button
                    type="button"
                    id="clear-image-btn"
                    onClick={clearImage}
                    className="text-white text-xs hover:text-red-300 font-semibold"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="rl-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <button
            id="submit-lost-report-btn"
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Lost Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportLost;
