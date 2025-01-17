import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Ride {
  date: string;
  distance: number;
  averageSpeed: number;
  positions: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
}

const RideHistory: React.FC = () => {
  const [rides, setRides] = React.useState<Ride[]>([]);

  React.useEffect(() => {
    const savedRides = JSON.parse(localStorage.getItem('rides') || '[]');
    setRides(savedRides);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDuration = (positions: Ride['positions']) => {
    if (positions.length < 2) return '0 min';
    const duration = (positions[positions.length - 1].timestamp - positions[0].timestamp) / 1000; // in seconds
    const minutes = Math.floor(duration / 60);
    return `${minutes} min`;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Rides</h2>
      
      <div className="space-y-4">
        {rides.map((ride, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{formatDate(ride.date)}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>{calculateDuration(ride.positions)}</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-xl font-bold">{ride.distance.toFixed(2)} km</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">Avg Speed</p>
                <p className="text-xl font-bold">{ride.averageSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </Card>
        ))}
        
        {rides.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p>No rides recorded yet. Start your first ride!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;