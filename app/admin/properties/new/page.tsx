import React from 'react';
import { PropertyForm } from '@/components/admin/property-form/PropertyForm';
import { requireAdmin } from '@/lib/auth/dal';
import { emptyPropertyValues } from '@/lib/properties/form';

export default async function AdminNewPropertyPage() {
  await requireAdmin('/admin/properties/new');

  return <PropertyForm propertyId={null} initialValues={emptyPropertyValues} />;
}
