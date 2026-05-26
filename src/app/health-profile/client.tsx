'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HealthProfile {
  age: string;
  gender: string;
  bloodType: string;
  weight: string;
  height: string;
  allergies: string;
  medications: string;
}

export default function HealthProfileClient() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>({
    age: '',
    gender: '',
    bloodType: '',
    weight: '',
    height: '',
    allergies: '',
    medications: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({
        title: 'Success',
        description: 'Health profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save health profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal health information
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Health Information</CardTitle>
            <CardDescription>
              Keep your health data up to date for better personalized recommendations
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                value={profile.age}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profile.gender}
                onValueChange={(value) =>
                  handleSelectChange('gender', value)
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                value={profile.bloodType}
                onValueChange={(value) =>
                  handleSelectChange('bloodType', value)
                }
                disabled={!isEditing}
              >
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="Enter your weight"
                value={profile.weight}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="Enter your height"
                value={profile.height}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="allergies">Known Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              placeholder="List any allergies (e.g., penicillin, peanuts)"
              value={profile.allergies}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-24"
            />
          </div>

          {/* Current Medications */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              name="medications"
              placeholder="List current medications with dosage"
              value={profile.medications}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-24"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
