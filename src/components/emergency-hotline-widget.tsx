'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle } from 'lucide-react';

const emergencyContacts = [
  { country: 'India', number: '102', name: 'Ambulance' },
  { country: 'India', number: '108', name: 'Emergency Response Support System' },
  { country: 'USA', number: '911', name: 'Emergency Services' },
  { country: 'UK', number: '999', name: 'Emergency Services' },
];

export default function EmergencyHotlineWidget() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-900">Emergency Hotlines</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.number}
              className="flex items-center justify-between rounded-lg bg-white p-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {contact.name}
                </p>
                <p className="text-xs text-gray-500">{contact.country}</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCall(contact.number)}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                {contact.number}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-red-700">
          ⚠️ In case of life-threatening emergency, always call your local emergency number immediately.
        </p>
      </CardContent>
    </Card>
  );
}
