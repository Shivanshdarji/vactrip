import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const initialForm = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  budget: '',
  is_public: false,
  cover_photo: null,
};

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [pending, setPending] = useState(false);

  // Revoke previous object URL to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canSubmit = useMemo(() => !pending, [pending]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cover_photo: 'Please upload a valid image (JPG, PNG, or WEBP).',
      }));
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    setField('cover_photo', file);
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Trip name is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!form.start_date) nextErrors.start_date = 'Start date is required.';
    if (!form.end_date) nextErrors.end_date = 'End date is required.';

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      nextErrors.end_date = 'End date must be after start date.';
    }

    const budgetNumber = Number(form.budget);
    if (!form.budget) {
      nextErrors.budget = 'Budget is required.';
    } else if (Number.isNaN(budgetNumber) || budgetNumber <= 0) {
      nextErrors.budget = 'Budget must be a positive number.';
    }

    if (form.cover_photo && !IMAGE_TYPES.includes(form.cover_photo.type)) {
      nextErrors.cover_photo = 'Please upload a valid image (JPG, PNG, or WEBP).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setPending(true);
    try {
      // Use FormData because backend expects multipart/form-data for file upload.
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('description', form.description.trim());
      payload.append('start_date', form.start_date);
      payload.append('end_date', form.end_date);
      payload.append('budget', form.budget);
      payload.append('is_public', String(form.is_public));
      if (form.cover_photo) payload.append('cover_photo', form.cover_photo);

      const { data } = await api.post('/trips', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const tripId = data?.trip?.id;
      if (!tripId) {
        throw new Error('Trip created, but trip id is missing in response.');
      }

      navigate(`/trips/${tripId}/builder`, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setApiError('Your session expired. Please login again.');
        navigate('/login', { replace: true });
        return;
      }

      setApiError(
        err.response?.data?.message ||
          'Could not create trip right now. Please try again.'
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <TravelShell>
      <AppNavbar />
      <section className="relative flex-1 overflow-hidden px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/12 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1503220317375-16bb608e8d84?auto=format&fit=crop&w=1800&q=75"
              alt=""
              className="h-44 w-full object-cover sm:h-52"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/90">
                Plan your next escape
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl">
                Create a trip that feels like a premium journey.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
                Set your timeline, budget, and vibe in one place. Refine stops and activities inside
                the itinerary builder after this step.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <h2 className="text-xl font-semibold text-white">Trip details</h2>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-200">Trip Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Summer in Himachal"
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                  />
                  {errors.name ? <p className="mt-2 text-xs text-rose-300">{errors.name}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-200">Description *</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="What kind of trip are you planning?"
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                  />
                  {errors.description ? (
                    <p className="mt-2 text-xs text-rose-300">{errors.description}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-200">Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setField('start_date', e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                    />
                    {errors.start_date ? (
                      <p className="mt-2 text-xs text-rose-300">{errors.start_date}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-200">End Date *</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setField('end_date', e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                    />
                    {errors.end_date ? (
                      <p className="mt-2 text-xs text-rose-300">{errors.end_date}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <h2 className="text-xl font-semibold text-white">Budget & visibility</h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-200">Budget (INR) *</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.budget}
                      onChange={(e) => setField('budget', e.target.value)}
                      placeholder="50000"
                      className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                    />
                    {errors.budget ? (
                      <p className="mt-2 text-xs text-rose-300">{errors.budget}</p>
                    ) : null}
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/15 bg-black/20 px-4 py-3 transition hover:bg-black/30">
                    <div>
                      <p className="text-sm font-medium text-white">Make trip public</p>
                      <p className="text-xs text-stone-300">
                        Public trips can be showcased in community experiences.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setField('is_public', e.target.checked)}
                      className="h-5 w-5 rounded border-white/30 bg-transparent text-cyan-300 focus:ring-cyan-300/40"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <h2 className="text-xl font-semibold text-white">Cover photo</h2>
                <p className="mt-2 text-xs text-stone-300">JPG, PNG or WEBP supported.</p>

                <div className="mt-5">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20 px-4 py-5 text-sm font-medium text-stone-200 transition hover:border-cyan-300/60 hover:text-white">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {form.cover_photo ? 'Replace image' : 'Upload cover photo'}
                  </label>
                  {errors.cover_photo ? (
                    <p className="mt-2 text-xs text-rose-300">{errors.cover_photo}</p>
                  ) : null}
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-white/15 bg-black/20">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Trip cover preview" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-stone-400">
                      Image preview will appear here
                    </div>
                  )}
                </div>
              </div>

              {apiError ? (
                <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {apiError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-cyan-500/30 transition hover:scale-[1.01] hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                    Creating trip...
                  </span>
                ) : (
                  'Create Trip'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </TravelShell>
  );
}
