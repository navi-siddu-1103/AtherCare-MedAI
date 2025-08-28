import HospitalsClient from './hospitals-client';

export default function HospitalsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Nearby Hospitals</h1>
      <p className="mt-2 text-muted-foreground">
        Find hospitals and medical centers near your location.
      </p>
      <HospitalsClient />
    </div>
  );
}
