import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="gradient-card border-card-border shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">404</span>
            </div>
            <CardTitle className="text-3xl font-bold font-poppins">Page Not Found</CardTitle>
            <CardDescription className="text-base">
              Oops! The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tried to access: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                variant="hero" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
