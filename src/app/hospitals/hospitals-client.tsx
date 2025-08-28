'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hospital, MapPin, Navigation, Loader2, Search, Tag, UserCheck, UserX, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { findHospitals } from '@/ai/flows/find-hospitals';
import type { FindHospitalsOutput } from '@/ai/flows/find-hospitals';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Hospital = FindHospitalsOutput['hospitals'][0];

const initialMockHospitals: Hospital[] = [
  { name: 'City General Hospital', address: '123 Health St, Metropolis', distance: '1.2 mi', services: ['Emergency', 'Cardiology', 'Pediatrics'], emergencyDoctorAvailability: 'Available' },
  { name: 'Unity Medical Center', address: '456 Wellness Ave, Metropolis', distance: '2.5 mi', services: ['Surgery', 'Oncology', 'Orthopedics'], emergencyDoctorAvailability: 'On-call' },
  { name: 'St. Jude\'s Clinic', address: '789 Care Blvd, Metropolis', distance: '3.1 mi', services: ['Family Medicine', 'Dermatology'], emergencyDoctorAvailability: 'Unavailable' },
];

const availabilityInfo: Record<string, { icon: React.ElementType, color: string, label: string }> = {
    'Available': { icon: UserCheck, color: 'text-green-600', label: 'Available' },
    'On-call': { icon: Clock, color: 'text-yellow-600', label: 'On-call' },
    'Unavailable': { icon: UserX, color: 'text-red-600', label: 'Unavailable' },
  };

export default function HospitalsClient() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  const [hospitals, setHospitals] = useState<Hospital[]>(initialMockHospitals);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string | null>(
    'Displaying mock hospitals near your detected location. Use the search bar to find hospitals in a specific city.'
  );

  const { toast } = useToast();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setError(null);
          setLoadingLocation(false);
        },
        (error) => {
          setError(`Error getting location: ${error.message}. Showing mock data.`);
          setLoadingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Showing mock data.');
      setLoadingLocation(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Search Query',
        description: 'Please enter a city name to search for hospitals.',
      });
      return;
    }

    setIsSearching(true);
    setSearchSummary(null);
    setHospitals([]);

    try {
      const result = await findHospitals({ query: `hospitals in ${searchQuery}` });
      setHospitals(result.hospitals);
      setSearchSummary(result.summary);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Search failed: ${errorMsg}`);
      setHospitals(initialMockHospitals);
      setSearchSummary('Could not perform AI search. Displaying default mock data.');
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: errorMsg,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const renderAvailability = (availability: string) => {
    const info = availabilityInfo[availability] || { icon: Clock, color: 'text-muted-foreground', label: 'Unknown' };
    const Icon = info.icon;
    return (
      <div className={cn('flex items-center text-sm font-semibold', info.color)}>
        <Icon className="mr-1.5 h-4 w-4" />
        <span>{info.label}</span>
      </div>
    );
  };


  return (
    <div className="mt-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Hospitals</CardTitle>
          <CardDescription>Enter a city to find hospitals using our AI assistant.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Metropolis"
              className="flex-1"
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(loadingLocation || isSearching || error || searchSummary) && (
        <Alert className="mb-6 animate-in fade-in-50">
          <MapPin className="h-4 w-4" />
          <AlertTitle>
            {isSearching ? 'AI is searching...' : (error ? 'Location Error' : 'Search Information')}
          </AlertTitle>
          <AlertDescription>
            {loadingLocation && 'Fetching your location...'}
            {isSearching && `Searching for hospitals in ${searchQuery}. Please wait.`}
            {!isSearching && error}
            {!isSearching && !error && searchSummary}
          </AlertDescription>
        </Alert>
      )}

      {hospitals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital, index) => (
            <Card key={index} className="flex flex-col transition-shadow hover:shadow-lg animate-in fade-in-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{hospital.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center pt-1">
                      <MapPin className="mr-1.5 h-4 w-4" />
                      {hospital.address}
                    </CardDescription>
                  </div>
                  <Hospital className="h-8 w-8 text-primary/70" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-between">
                <div>
                   <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">Emergency Doctor Status</h4>
                    {renderAvailability(hospital.emergencyDoctorAvailability)}
                  </div>
                  <h4 className="mb-2 text-sm font-medium flex items-center"><Tag className="mr-1.5 h-4 w-4" /> Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.services.map(service => (
                      <Badge key={service} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
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
      ) : (
        !isSearching && (
           <div className="text-center py-12 text-muted-foreground">
              <Hospital className="mx-auto h-12 w-12" />
              <p className="mt-4">No hospitals found for your search.</p>
           </div>
        )
      )}
    </div>
  );
}
