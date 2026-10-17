import React from 'react';
import { notFound } from 'next/navigation';
import { PropertyForm } from '@/components/admin/property-form/PropertyForm';
import { requireAdmin } from '@/lib/auth/dal';
import { getPropertyForEdit } from '@/lib/supabase/admin';
import { rowToFormValues } from '@/lib/properties/form';

interface AdminEditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPropertyPage({ params }: AdminEditPropertyPageProps) {
  const { id } = await params;
  await requireAdmin(`/admin/properties/${encodeURIComponent(id)}/edit`);

  const property = await getPropertyForEdit(id);
  if (!property) notFound();

  return (
    <PropertyForm
      propertyId={property.id}
      initialValues={rowToFormValues(property)}
      isDraft={property.is_published === false}
    />
  );
}
