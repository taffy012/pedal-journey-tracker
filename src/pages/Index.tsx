import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import RideTracker from "@/components/RideTracker";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <RideTracker />;
};

export default Index;