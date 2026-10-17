'use client';

import React, { useCallback, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { saveProperty, type SavePropertyIntent } from '@/app/admin/properties/actions';
import { useI18n } from '@/i18n/I18nProvider';
import { format } from '@/i18n/format';
import {
  AMENITY_KEYS,
  BADGE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  PROPERTY_CATEGORIES,
  TITLE_MAX_LENGTH,
  defaultDisplayLocation,
  type PropertyFieldErrors,
  type PropertyFormValues,
} from '@/lib/properties/form';
import {
  FieldError,
  FormSection,
  Label,
  Stepper,
  compactInputClass,
  inputClass,
} from '@/components/admin/property-form/FormParts';
import { GalleryField } from '@/components/admin/property-form/GalleryField';

interface PropertyFormProps {
  // null when creating a property
  propertyId: string | null;
  initialValues: PropertyFormValues;
  isDraft?: boolean;
}

const FORM_ID = 'property-form';

// Layout and classes follow antigraviti/resources/add_edit_property_form
export const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, initialValues, isDraft = false }) => {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<PropertyFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<SavePropertyIntent | null>(null);
  const [isPending, startTransition] = useTransition();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const isEdit = propertyId !== null;
  const busy = isPending || isUploading;

  const set = <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear the error of a field as soon as it is edited
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleImagesChange = useCallback((images: string[]) => {
    setValues((prev) => ({ ...prev, images }));
    setFieldErrors((prev) => (prev.images ? { ...prev, images: undefined } : prev));
  }, []);

  const errorText = (key: keyof PropertyFormValues) => {
    const code = fieldErrors[key];
    return code ? t.errors[code] : undefined;
  };

  const errorProps = (key: keyof PropertyFormValues) =>
    fieldErrors[key]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${key}-error` }
      : {};

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent: SavePropertyIntent = submitter?.value === 'draft' ? 'draft' : 'publish';
    if (busy) return;

    setFormError(null);
    setPendingIntent(intent);
    startTransition(async () => {
      // Redirects to the property list on success
      const result = await saveProperty(propertyId, values, intent);
      setPendingIntent(null);
      if (!result) return;
      if (result.error === 'invalid') {
        setFieldErrors(result.fieldErrors);
        setFormError(t.errors.summary);
      } else {
        setFormError(t.errors[result.error]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Wraps the selection in Markdown-style markers, rendered on the property page
  const applyFormat = (kind: 'bold' | 'italic' | 'list') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end);

    let replacement: string;
    if (kind === 'list') {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const block = value.slice(lineStart, end) || '';
      replacement = block
        .split('\n')
        .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
        .join('\n');
      const next = (value.slice(0, lineStart) + replacement + value.slice(end)).slice(0, DESCRIPTION_MAX_LENGTH);
      set('description', next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + replacement.length, lineStart + replacement.length);
      });
      return;
    }

    const marker = kind === 'bold' ? '**' : '_';
    replacement = `${marker}${selected}${marker}`;
    const next = (value.slice(0, start) + replacement + value.slice(end)).slice(0, DESCRIPTION_MAX_LENGTH);
    set('description', next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  };

  const lat = Number(values.latitude);
  const lng = Number(values.longitude);
  const hasCoordinates =
    values.latitude.trim() !== '' &&
    values.longitude.trim() !== '' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;
  const mapSrc = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.006},${lng + 0.01},${lat + 0.006}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const displayLocationExample = defaultDisplayLocation(values) || 'Miami, FL';
  const amenityLabels: Record<string, string> = dict.property.features.amenityList;

  const spinner = <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />;

  return (
    <div className="pb-24 md:pb-0">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <li>
                <Link className="hover:text-mosque transition-colors" href="/admin">
                  {dict.admin.nav.properties}
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400">chevron_right</span>
              </li>
              <li aria-current="page" className="text-nordic">
                {isEdit ? t.breadcrumbEdit : t.breadcrumbNew}
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
              {isEdit ? t.titleEdit : t.titleNew}
            </h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal">{t.subtitle}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          <button
            type="submit"
            form={FORM_ID}
            name="intent"
            value="draft"
            disabled={busy}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pendingIntent === 'draft' ? t.saving : t.saveDraft}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            name="intent"
            value="publish"
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pendingIntent === 'publish' ? spinner : <span className="material-icons text-sm">save</span>}
            {pendingIntent === 'publish' ? t.saving : t.save}
          </button>
        </div>
      </header>

      {isDraft && (
        <p className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="material-icons text-base">edit_note</span>
          {t.draftNotice}
        </p>
      )}
      {formError && (
        <p
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="material-icons text-base">error_outline</span>
          {formError}
        </p>
      )}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
      >
        <div className="xl:col-span-8 space-y-8">
          {/* Basic information */}
          <FormSection icon="info" title={t.basicInfo}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" required>
                  {t.propertyTitle}
                </Label>
                <input
                  id="title"
                  type="text"
                  value={values.title}
                  maxLength={TITLE_MAX_LENGTH}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className={`${inputClass(!!fieldErrors.title)} text-base`}
                  {...errorProps('title')}
                />
                <FieldError id="title-error" message={errorText('title')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price" required>
                    {t.price}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id="price"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={values.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass(!!fieldErrors.price)} pl-7 text-base font-medium`}
                      {...errorProps('price')}
                    />
                  </div>
                  <FieldError id="price-error" message={errorText('price')} />
                  {values.listingType === 'rent' && (
                    <p className="mt-1.5 text-xs text-gray-400">{t.perMonth}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="listingType">{t.status}</Label>
                  <select
                    id="listingType"
                    value={values.listingType}
                    onChange={(e) => set('listingType', e.target.value as PropertyFormValues['listingType'])}
                    className={`${inputClass()} text-base cursor-pointer`}
                  >
                    <option value="buy">{dict.listing.forSale}</option>
                    <option value="rent">{dict.listing.forRent}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">{t.propertyType}</Label>
                  <select
                    id="category"
                    value={values.category}
                    onChange={(e) => set('category', e.target.value as PropertyFormValues['category'])}
                    className={`${inputClass()} text-base cursor-pointer`}
                  >
                    {PROPERTY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {dict.categories[category]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Not in the design: fields the public site already shows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <Label htmlFor="badge">{t.badge}</Label>
                  <input
                    id="badge"
                    type="text"
                    value={values.badge}
                    maxLength={BADGE_MAX_LENGTH}
                    onChange={(e) => set('badge', e.target.value)}
                    placeholder={t.badgePlaceholder}
                    className={`${inputClass(!!fieldErrors.badge)} text-base`}
                    {...errorProps('badge')}
                  />
                  <FieldError id="badge-error" message={errorText('badge')} />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer group py-2.5">
                  <input
                    type="checkbox"
                    checked={values.isFeatured}
                    onChange={(e) => set('isFeatured', e.target.checked)}
                    className="w-4 h-4 accent-mosque border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-nordic transition-colors">
                    {t.featured}
                  </span>
                </label>
              </div>
            </div>
          </FormSection>

          {/* Description */}
          <FormSection icon="description" title={t.description}>
            <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
              {(
                [
                  ['bold', 'format_bold', t.bold],
                  ['italic', 'format_italic', t.italic],
                  ['list', 'format_list_bulleted', t.list],
                ] as const
              ).map(([kind, icon, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => applyFormat(kind)}
                  aria-label={label}
                  title={label}
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
                >
                  <span className="material-icons text-lg">{icon}</span>
                </button>
              ))}
            </div>
            <textarea
              id="description"
              ref={descriptionRef}
              aria-label={t.description}
              value={values.description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              onChange={(e) => set('description', e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className={`${inputClass(!!fieldErrors.description)} py-3 text-base leading-relaxed resize-y min-h-[200px]`}
              {...errorProps('description')}
            />
            <FieldError id="description-error" message={errorText('description')} />
            <div className="mt-2 text-right text-xs text-gray-400">
              {format(t.characters, { count: values.description.length, max: DESCRIPTION_MAX_LENGTH })}
            </div>
          </FormSection>

          <GalleryField
            images={values.images}
            onChange={handleImagesChange}
            onUploadingChange={setIsUploading}
            error={errorText('images')}
          />
        </div>

        <div className="xl:col-span-4 space-y-8">
          {/* Location */}
          <FormSection icon="place" title={t.location} compact>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" required>
                  {t.address}
                </Label>
                <input
                  id="address"
                  type="text"
                  value={values.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className={`${inputClass(!!fieldErrors.address)} text-sm`}
                  {...errorProps('address')}
                />
                <FieldError id="address-error" message={errorText('address')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="city" required>
                    {t.city}
                  </Label>
                  <input
                    id="city"
                    type="text"
                    value={values.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={`${inputClass(!!fieldErrors.city)} text-sm`}
                    {...errorProps('city')}
                  />
                  <FieldError id="city-error" message={errorText('city')} />
                </div>
                <div>
                  <Label htmlFor="state">{t.state}</Label>
                  <input
                    id="state"
                    type="text"
                    value={values.state}
                    onChange={(e) => set('state', e.target.value)}
                    className={`${inputClass()} text-sm`}
                  />
                </div>
                <div>
                  <Label htmlFor="country">{t.country}</Label>
                  <input
                    id="country"
                    type="text"
                    value={values.country}
                    onChange={(e) => set('country', e.target.value)}
                    className={`${inputClass()} text-sm`}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="displayLocation">{t.displayLocation}</Label>
                <input
                  id="displayLocation"
                  type="text"
                  value={values.displayLocation}
                  onChange={(e) => set('displayLocation', e.target.value)}
                  placeholder={displayLocationExample}
                  aria-describedby="displayLocation-hint"
                  className={`${inputClass()} text-sm`}
                />
                <p id="displayLocation-hint" className="mt-1.5 text-xs text-gray-400">
                  {format(t.displayLocationHint, { example: displayLocationExample })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">{t.latitude}</Label>
                  <input
                    id="latitude"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={values.latitude}
                    onChange={(e) => set('latitude', e.target.value)}
                    placeholder="25.7617"
                    className={`${inputClass(!!fieldErrors.latitude)} text-sm`}
                    {...errorProps('latitude')}
                  />
                  <FieldError id="latitude-error" message={errorText('latitude')} />
                </div>
                <div>
                  <Label htmlFor="longitude">{t.longitude}</Label>
                  <input
                    id="longitude"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={values.longitude}
                    onChange={(e) => set('longitude', e.target.value)}
                    placeholder="-80.1918"
                    className={`${inputClass(!!fieldErrors.longitude)} text-sm`}
                    {...errorProps('longitude')}
                  />
                  <FieldError id="longitude-error" message={errorText('longitude')} />
                </div>
              </div>
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                {mapSrc ? (
                  <iframe
                    title={t.mapPreview}
                    src={mapSrc}
                    className="w-full h-full border-0 opacity-80 group-hover:opacity-100 transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-end justify-center p-4 bg-hint-green/30">
                    <p className="text-xs text-gray-500 text-center">{t.mapHint}</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/90 text-nordic px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold flex items-center gap-1">
                    <span className="material-icons text-sm text-mosque">map</span> {t.mapPreview}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Details */}
          <FormSection icon="straighten" title={t.details} compact className="xl:sticky xl:top-28">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="sqm">
                    {t.area}
                  </label>
                  <input
                    id="sqm"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={values.sqm}
                    onChange={(e) => set('sqm', e.target.value)}
                    placeholder="0"
                    className={compactInputClass(!!fieldErrors.sqm)}
                    {...errorProps('sqm')}
                  />
                  <FieldError id="sqm-error" message={errorText('sqm')} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="yearBuilt">
                    {t.yearBuilt}
                  </label>
                  <input
                    id="yearBuilt"
                    type="number"
                    inputMode="numeric"
                    min={1800}
                    step={1}
                    value={values.yearBuilt}
                    onChange={(e) => set('yearBuilt', e.target.value)}
                    placeholder={t.yearPlaceholder}
                    className={compactInputClass(!!fieldErrors.yearBuilt)}
                    {...errorProps('yearBuilt')}
                  />
                  <FieldError id="yearBuilt-error" message={errorText('yearBuilt')} />
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="space-y-4">
                <Stepper
                  id="beds"
                  icon="bed"
                  label={t.bedrooms}
                  value={values.beds}
                  onChange={(v) => set('beds', v)}
                  decreaseLabel={t.decrease}
                  increaseLabel={t.increase}
                />
                <Stepper
                  id="baths"
                  icon="shower"
                  label={t.bathrooms}
                  value={values.baths}
                  onChange={(v) => set('baths', v)}
                  decreaseLabel={t.decrease}
                  increaseLabel={t.increase}
                />
                <Stepper
                  id="parking"
                  icon="directions_car"
                  label={t.parking}
                  value={values.parking}
                  onChange={(v) => set('parking', v)}
                  decreaseLabel={t.decrease}
                  increaseLabel={t.increase}
                />
              </div>
              <hr className="border-gray-100" />
              <fieldset>
                <legend className="font-bold mb-3 uppercase tracking-wider text-xs text-gray-500">
                  {t.amenities}
                </legend>
                <div className="space-y-2">
                  {AMENITY_KEYS.map((key) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={values.amenities.includes(key)}
                        onChange={(e) =>
                          set(
                            'amenities',
                            e.target.checked
                              ? [...values.amenities, key]
                              : values.amenities.filter((a) => a !== key)
                          )
                        }
                        className="w-4 h-4 accent-mosque border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-nordic transition-colors">
                        {amenityLabels[key] ?? key}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </FormSection>
        </div>

        {/* Mobile action bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
          <Link
            href="/admin"
            className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium text-center"
          >
            {t.cancel}
          </Link>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={busy}
            className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {pendingIntent === 'publish' && spinner}
            {pendingIntent === 'publish' ? t.saving : t.save}
          </button>
        </div>
      </form>
    </div>
  );
};
