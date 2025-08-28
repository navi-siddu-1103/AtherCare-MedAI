'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mockHospitals = [
  { name: 'City General Hospital', address: '123 Health St, Metropolis', distance: '1.2 mi' },
  { name: 'Unity Medical Center', address: '456 Wellness Ave, Metropolis', distance: '2.5 mi' },
  { name: 'St. Jude\'s Clinic', address: '789 Care Blvd, Metropolis', distance: '3.1 mi' },
  { name: 'County Health Services', address: '101 Healing Rd, Metropolis', distance: '4.8 mi' },
  { name: 'Hopewell Emergency Care', address: '210 Rescue Run, Metropolis', distance: '5.2 mi'},
  { name: 'Metropolis University Hospital', address: '555 University Dr, Metropolis', distance: '6.0 mi' },
];

export default function HospitalsClient() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setError(`Error getting location: ${error.message}. Showing mock data for Metropolis.`);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Showing mock data for Metropolis.');
      setLoading(false);
    }
  }, []);

  return (
    <div className="mt-6">
      {loading && (
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Fetching your location...</span>
        </div>
      )}

      {error && !loading && (
        <Alert variant="default" className="mb-6">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Location Information</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {location && !loading && (
         <Alert className="mb-6">
           <MapPin className="h-4 w-4" />
           <AlertTitle>Location Found!</AlertTitle>
           <AlertDescription>
             Displaying mock hospitals near your location. This is a demo feature.
           </AlertDescription>
         </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockHospitals.map((hospital, index) => (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{hospital.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    {hospital.address}
                  </CardDescription>
                </div>
                <Hospital className="h-8 w-8 text-primary/70" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Distance: {hospital.distance}</span>
                <Button variant="outline" size="sm">
                  <Navigation className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
