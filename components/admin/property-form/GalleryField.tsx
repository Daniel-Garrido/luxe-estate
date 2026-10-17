'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { discardUploadedImages } from '@/app/admin/properties/actions';
import { useI18n } from '@/i18n/I18nProvider';
import { format } from '@/i18n/format';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  PROPERTY_IMAGES_BUCKET,
} from '@/lib/properties/form';
import { FormSection } from '@/components/admin/property-form/FormParts';

interface PendingUpload {
  id: string;
  name: string;
  preview: string;
  // URL of the image being replaced, or null when it is a new image
  replaceUrl: string | null;
}

interface GalleryFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  // Lets the form block saving while photos are still uploading
  onUploadingChange: (uploading: boolean) => void;
  error?: string;
}

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Uploads straight from the browser to the Supabase bucket (storage RLS only lets admins write),
// so large photos never go through a Server Function
export const GalleryField: React.FC<GalleryFieldProps> = ({ images, onChange, onUploadingChange, error }) => {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceUrlRef = useRef<string | null>(null);
  // Latest list, so uploads that finish later don't overwrite each other
  const imagesRef = useRef(images);
  // Photos uploaded in this visit: safe to delete right away if they are removed before saving
  const sessionUploadsRef = useRef(new Set<string>());

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    onUploadingChange(pending.length > 0);
  }, [pending.length, onUploadingChange]);

  const update = (next: string[]) => {
    imagesRef.current = next;
    onChange(next);
  };

  const discard = (url: string) => {
    if (!sessionUploadsRef.current.has(url)) return; // Saved photos are deleted when the form is saved
    sessionUploadsRef.current.delete(url);
    void discardUploadedImages([url]);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      return null;
    }
    const url = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    sessionUploadsRef.current.add(url);
    return url;
  };

  const handleFiles = async (fileList: FileList | null, replaceUrl: string | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const errors: string[] = [];
    let valid = files.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(format(t.uploadErrors.type, { name: file.name }));
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        errors.push(format(t.uploadErrors.size, { name: file.name }));
        return false;
      }
      return true;
    });

    if (replaceUrl === null) {
      const room = MAX_IMAGES - imagesRef.current.length - pending.filter((p) => p.replaceUrl === null).length;
      if (valid.length > room) {
        errors.push(format(t.uploadErrors.limit, { max: MAX_IMAGES }));
        valid = valid.slice(0, Math.max(0, room));
      }
    } else {
      valid = valid.slice(0, 1);
    }
    setUploadErrors(errors);

    const uploads = valid.map((file) => ({
      file,
      item: {
        id: crypto.randomUUID(),
        name: file.name,
        preview: URL.createObjectURL(file),
        replaceUrl,
      },
    }));
    setPending((prev) => [...prev, ...uploads.map((u) => u.item)]);

    await Promise.all(
      uploads.map(async ({ file, item }) => {
        const url = await uploadFile(file);
        setPending((prev) => prev.filter((p) => p.id !== item.id));
        URL.revokeObjectURL(item.preview);

        if (!url) {
          setUploadErrors((prev) => [...prev, format(t.uploadErrors.failed, { name: file.name })]);
          return;
        }
        const current = imagesRef.current;
        // The replaced photo keeps its position, even if the gallery was reordered meanwhile
        if (item.replaceUrl !== null && current.includes(item.replaceUrl)) {
          update(current.map((img) => (img === item.replaceUrl ? url : img)));
          discard(item.replaceUrl);
        } else {
          update([...current, url]);
        }
      })
    );
  };

  const removeAt = (index: number) => {
    const url = images[index];
    update(images.filter((_, i) => i !== index));
    discard(url);
  };

  const makeMain = (index: number) => {
    update([images[index], ...images.filter((_, i) => i !== index)]);
  };

  const openReplace = (url: string) => {
    replaceUrlRef.current = url;
    replaceInputRef.current?.click();
  };

  const accept = ACCEPTED_IMAGE_TYPES.join(',');
  const newUploads = pending.filter((p) => p.replaceUrl === null);
  const actionButton =
    'w-8 h-8 rounded-full bg-white flex items-center justify-center transition-colors cursor-pointer';

  return (
    <FormSection
      icon="image"
      title={t.gallery}
      aside={
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{t.galleryFormats}</span>
      }
    >
      <div
        className={`relative border-2 border-dashed rounded-xl bg-gray-50/50 p-10 text-center hover:bg-hint-green/10 hover:border-mosque/40 transition-colors cursor-pointer group ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        {/* Covers the whole drop zone, so both clicking and dropping files work natively */}
        <input
          type="file"
          multiple
          accept={accept}
          aria-label={t.dropTitle}
          aria-describedby={error ? 'images-error' : undefined}
          onChange={(e) => {
            void handleFiles(e.target.files, null);
            e.target.value = '';
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
            <span className="material-icons text-2xl">cloud_upload</span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-nordic">{t.dropTitle}</p>
            <p className="text-xs text-gray-400">{t.dropHint}</p>
          </div>
        </div>
      </div>

      {error && (
        <p id="images-error" className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}
      {uploadErrors.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-red-600" role="alert">
          {uploadErrors.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {images.map((url, index) => {
          const replacing = pending.find((p) => p.replaceUrl === url);
          return (
            <div key={url} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm">
              {/* Plain <img>: photos come from the bucket and from external seed data */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={replacing?.preview ?? url} alt="" className="w-full h-full object-cover" />
              {replacing ? (
                <UploadingOverlay label={t.uploading} />
              ) : (
                <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={t.remove}
                    title={t.remove}
                    className={`${actionButton} text-red-500 hover:bg-red-50`}
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openReplace(url)}
                    aria-label={t.replace}
                    title={t.replace}
                    className={`${actionButton} text-nordic hover:bg-gray-50`}
                  >
                    <span className="material-icons text-sm">edit</span>
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(index)}
                      aria-label={t.makeMain}
                      title={t.makeMain}
                      className={`${actionButton} text-mosque hover:bg-hint-green/40`}
                    >
                      <span className="material-icons text-sm">star</span>
                    </button>
                  )}
                </div>
              )}
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                  {t.main}
                </span>
              )}
            </div>
          );
        })}

        {newUploads.map((item) => (
          <div key={item.id} className="aspect-square rounded-lg overflow-hidden relative shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt="" className="w-full h-full object-cover" />
            <UploadingOverlay label={t.uploading} />
          </div>
        ))}

        {images.length + newUploads.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group cursor-pointer"
          >
            <span className="material-icons group-hover:scale-110 transition-transform">add</span>
            <span className="text-xs mt-1 font-medium">{t.addMore}</span>
          </button>
        )}
      </div>

      <input
        ref={addInputRef}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files, null);
          e.target.value = '';
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files, replaceUrlRef.current);
          e.target.value = '';
        }}
      />
    </FormSection>
  );
};

const UploadingOverlay: React.FC<{ label: string }> = ({ label }) => (
  <div className="absolute inset-0 bg-nordic/50 flex flex-col items-center justify-center gap-2 text-white text-xs font-medium">
    <span className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
    {label}
  </div>
);
