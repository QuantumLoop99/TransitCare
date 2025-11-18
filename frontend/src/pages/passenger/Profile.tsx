import React, { useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchOnboardUser } from '../../lib/onboard';

export const Profile: React.FC = () => {
  const { user, isSignedIn } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email] = useState(
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ''
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentImageUrl = user?.imageUrl;
  const selectedPreview = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  if (!isSignedIn || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Please sign in to update your profile.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      // Update local backend profile via onboard upsert
      await fetchOnboardUser({
        clerkId: user.id,
        email,
        firstName,
        lastName,
      });

      // Optionally update Clerk display name locally (best-effort)
      try {
        // Some Clerk frontends allow updating basic fields
        // If this fails, we still keep local profile updated
        await user.update?.({ firstName, lastName } as any);
      } catch (_) {}

      setMessage('Profile updated successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);
    setError(null);
  };

  const onUpload = async () => {
    if (!isSignedIn || !user) return;
    if (!selectedFile) {
      setError('Please choose an image file to upload.');
      return;
    }
    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      // Clerk supports setting profile image directly from the client
      const setProfileImage = (user as any).setProfileImage;
      if (typeof setProfileImage !== 'function') {
        throw new Error('Profile image update is not available in this environment.');
      }

      await setProfileImage({ file: selectedFile });
      try {
        await (user as any).reload?.();
      } catch (_) {}
      setMessage('Profile picture updated successfully.');
      setSelectedFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Update Profile</h2>
          <p className="text-sm text-gray-600">Manage your account information</p>
        </CardHeader>
        <CardContent>
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile picture</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border">
                {/* Preview selected image if any; otherwise show current Clerk image */}
                {selectedPreview ? (
                  <img src={selectedPreview} alt="Selected" className="w-full h-full object-cover" />
                ) : currentImageUrl ? (
                  <img src={currentImageUrl} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={onFileChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Max 5MB. PNG, JPG, or WEBP.</p>
              </div>
              <Button type="button" onClick={onUpload} disabled={uploading || !selectedFile}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
