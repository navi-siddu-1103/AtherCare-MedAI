import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/skin-analysis': 'Skin Analysis',
  '/blood-report': 'Blood Report',
  '/symptom-checker': 'Symptom Checker',
  '/hospitals': 'Hospitals',
  '/chat': 'AI Chatbot',
  '/health-profile': 'Health Profile',
};

export interface Breadcrumb {
  label: string;
  href: string;
}

export function useBreadcrumbs(): Breadcrumb[] {
  const pathname = usePathname();

  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  if (pathname !== '/dashboard' && breadcrumbMap[pathname]) {
    breadcrumbs.push({
      label: breadcrumbMap[pathname],
      href: pathname,
    });
  }

  return breadcrumbs;
}
