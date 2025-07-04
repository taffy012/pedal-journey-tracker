import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Activity } from 'lucide-react';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

interface Ride {
  date: string;
  distance: number;
  averageSpeed: number;
  positions: Position[];
  duration: number;
}

const RideHistory: React.FC = () => {
  const [rides, setRides] = React.useState<Ride[]>([]);

  React.useEffect(() => {
    const savedRides = JSON.parse(localStorage.getItem('rides') || '[]');
    setRides(savedRides.sort((a: Ride, b: Ride) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Rides</h2>
      
      <div className="space-y-4">
        {rides.map((ride, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{formatDate(ride.date)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>{formatDuration(ride.duration)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="text-xl font-bold">{ride.distance.toFixed(2)} km</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Speed</p>
                  <p className="text-xl font-bold">{ride.averageSpeed.toFixed(1)} km/h</p>
                </div>
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