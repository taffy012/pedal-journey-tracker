import React, { useState, useEffect } from 'react';
import { Bike, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const RideTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  const calculateSpeed = (position: GeolocationPosition) => {
    if (position.coords.speed !== null) {
      // Convert m/s to km/h
      return position.coords.speed * 3.6;
    }
    return 0;
  };

  const calculateDistance = (newPosition: Position) => {
    if (positions.length === 0) return 0;
    
    const lastPosition = positions[positions.length - 1];
    const R = 6371; // Earth's radius in km
    
    const lat1 = lastPosition.latitude * Math.PI / 180;
    const lat2 = newPosition.latitude * Math.PI / 180;
    const dLat = lat2 - lat1;
    const dLon = (newPosition.longitude - lastPosition.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    return d;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };

        setPositions(prev => [...prev, newPosition]);
        setCurrentSpeed(calculateSpeed(position));
        setDistance(prev => prev + calculateDistance(newPosition));
      },
      (error) => {
        toast.error(`Error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
    setIsTracking(true);
    toast.success("Ride tracking started!");
  };

  const pauseTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsPaused(true);
  };

  const resumeTracking = () => {
    startTracking();
    setIsPaused(false);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Save ride data
    const rideData = {
      date: new Date().toISOString(),
      distance,
      averageSpeed: currentSpeed,
      positions,
    };
    
    const savedRides = JSON.parse(localStorage.getItem('rides') || '[]');
    localStorage.setItem('rides', JSON.stringify([...savedRides, rideData]));
    
    // Reset states
    setIsTracking(false);
    setIsPaused(false);
    setCurrentSpeed(0);
    setDistance(0);
    setPositions([]);
    
    toast.success("Ride saved successfully!");
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8 bg-white shadow-lg animate-fade-in">
      <div className="flex items-center justify-center mb-6">
        <Bike className="w-12 h-12 text-primary" />
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Current Speed</p>
          <h2 className="text-4xl font-bold">{currentSpeed.toFixed(1)} km/h</h2>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Distance</p>
          <h2 className="text-4xl font-bold">{distance.toFixed(2)} km</h2>
        </div>
        
        <div className="flex justify-center space-x-4">
          {!isTracking ? (
            <Button
              onClick={startTracking}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Ride
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button
                  onClick={pauseTracking}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeTracking}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button
                onClick={stopTracking}
                variant="destructive"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RideTracker;