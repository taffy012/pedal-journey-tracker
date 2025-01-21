import React, { useState, useEffect, useRef } from 'react';
import { Bike, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

const RideTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const watchId = useRef<number | null>(null);
  const speedBuffer = useRef<number[]>([]);

  const calculateSpeed = (position: GeolocationPosition) => {
    const speed = position.coords.speed !== null ? position.coords.speed * 3.6 : calculateSpeedFromPositions();
    
    // Use a rolling average for smoother speed readings
    speedBuffer.current.push(speed);
    if (speedBuffer.current.length > 5) {
      speedBuffer.current.shift();
    }
    
    const averageSpeed = speedBuffer.current.reduce((a, b) => a + b, 0) / speedBuffer.current.length;
    return Math.max(0, averageSpeed); // Ensure speed is never negative
  };

  const calculateSpeedFromPositions = () => {
    if (positions.length < 2) return 0;
    
    const lastTwo = positions.slice(-2);
    const distance = calculateDistance(lastTwo[0], lastTwo[1]);
    const timeDiff = (lastTwo[1].timestamp - lastTwo[0].timestamp) / 1000; // in seconds
    
    return (distance / timeDiff) * 3600; // Convert to km/h
  };

  const calculateDistance = (pos1: Position, pos2: Position) => {
    const R = 6371; // Earth's radius in km
    const lat1 = pos1.latitude * Math.PI / 180;
    const lat2 = pos2.latitude * Math.PI / 180;
    const dLat = lat2 - lat1;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
        };

        // Only record position if accuracy is good enough (less than 20 meters)
        if (position.coords.accuracy <= 20) {
          setPositions(prev => {
            const updatedPositions = [...prev, newPosition];
            if (updatedPositions.length > 1) {
              const newDistance = calculateDistance(
                updatedPositions[updatedPositions.length - 2],
                newPosition
              );
              setDistance(prev => prev + newDistance);
            }
            return updatedPositions;
          });

          const speed = calculateSpeed(position);
          setCurrentSpeed(speed);
        }
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    watchId.current = id;
    setIsTracking(true);
    speedBuffer.current = [];
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
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (positions.length < 2) {
      toast.error("Ride too short to save");
      return;
    }

    // Calculate average speed for the entire ride
    const totalTime = (positions[positions.length - 1].timestamp - positions[0].timestamp) / 1000 / 3600; // in hours
    const averageSpeed = distance / totalTime;
    
    // Save ride data
    const rideData = {
      date: new Date().toISOString(),
      distance,
      averageSpeed,
      positions,
      duration: totalTime * 3600, // in seconds
    };
    
    const savedRides = JSON.parse(localStorage.getItem('rides') || '[]');
    localStorage.setItem('rides', JSON.stringify([...savedRides, rideData]));
    
    // Reset states
    setIsTracking(false);
    setIsPaused(false);
    setCurrentSpeed(0);
    setDistance(0);
    setPositions([]);
    speedBuffer.current = [];
    
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
