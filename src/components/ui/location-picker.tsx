import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Navigation, AlertTriangle } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

// Try to import Google Maps components, but handle gracefully if not available
let GoogleMap: any = null;
let useJsApiLoader: any = null;
let Marker: any = null;

try {
  const googleMapsModule = require('@react-google-maps/api');
  GoogleMap = googleMapsModule.GoogleMap;
  useJsApiLoader = googleMapsModule.useJsApiLoader;
  Marker = googleMapsModule.Marker;
} catch (error) {
  console.warn('Google Maps API not available:', error);
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 51.5074, // London coordinates
  lng: -0.1278
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className
}) => {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(initialLocation || null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const geocoder = useRef<any>(null);

  // Check if Google Maps API key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleMapsAvailable = GoogleMap && useJsApiLoader && apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  const { isLoaded } = useJsApiLoader ? useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || 'YOUR_API_KEY_HERE',
    libraries: ['places']
  }) : { isLoaded: false };

  const onLoad = useCallback((map: any) => {
    setMap(map);
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
    
    if (initialLocation) {
      map.setCenter(initialLocation);
      setMarker(initialLocation);
    }
  }, [initialLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event: any) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newLocation = { lat, lng };
      
      setMarker(newLocation);
      
      // Reverse geocode to get address
      if (geocoder.current) {
        geocoder.current.geocode({ location: newLocation }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            onLocationSelect({ lat, lng, address });
          }
        });
      }
    }
  }, [onLocationSelect]);

  const handleSearch = useCallback(() => {
    if (!searchAddress.trim() || !geocoder.current) return;
    
    setIsLoading(true);
    geocoder.current.geocode({ address: searchAddress }, (results: any, status: any) => {
      setIsLoading(false);
      
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const address = results[0].formatted_address;
        
        const newLocation = { lat, lng };
        setMarker(newLocation);
        
        if (map) {
          map.setCenter(newLocation);
          map.setZoom(15);
        }
        
        onLocationSelect({ lat, lng, address });
        setSearchAddress(address);
      }
    });
  }, [searchAddress, map, onLocationSelect]);

  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newLocation = { lat, lng };
          
          setMarker(newLocation);
          
          if (map) {
            map.setCenter(newLocation);
            map.setZoom(15);
          }
          
          // Reverse geocode to get address
          if (geocoder.current) {
            geocoder.current.geocode({ location: newLocation }, (results: any, status: any) => {
              setIsLoading(false);
              if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                onLocationSelect({ lat, lng, address });
                setSearchAddress(address);
              }
            });
          }
        },
        (error) => {
          setIsLoading(false);
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [map, onLocationSelect]);

  // Manual coordinate input fallback
  const [manualLat, setManualLat] = useState(initialLocation?.lat.toString() || '');
  const [manualLng, setManualLng] = useState(initialLocation?.lng.toString() || '');
  const [manualAddress, setManualAddress] = useState('');

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const location = { lat, lng, address: manualAddress || `${lat}, ${lng}` };
      onLocationSelect(location);
      setMarker({ lat, lng });
    }
  };

  // If Google Maps is not available, show fallback interface
  if (!isGoogleMapsAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Location Picker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Google Maps API Key Required</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              To use the interactive map, please set up your Google Maps API key. For now, you can manually enter coordinates.
            </p>
            <div className="text-xs text-yellow-600">
              <p>1. Get API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
              <p>2. Create a .env file with: VITE_GOOGLE_MAPS_API_KEY=your_api_key</p>
              <p>3. Restart the development server</p>
            </div>
          </div>

          {/* Manual coordinate input */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Manual Location Entry</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address (Optional)</label>
                <Input
                  placeholder="Enter address..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Latitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="52.406800"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Longitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="-1.519700"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleManualLocationSubmit}
              className="w-full"
              disabled={!manualLat || !manualLng}
            >
              Set Location
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Location Picker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Location Picker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex space-x-2">
          <Input
            placeholder="Enter address or postcode..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
          <Button 
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Current</span>
          </Button>
        </div>

        {/* Map */}
        <div className="border rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={marker || defaultCenter}
            zoom={marker ? 15 : 10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {marker && (
              <Marker
                position={marker}
                draggable={true}
                onDragEnd={(e: any) => {
                  if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    const newLocation = { lat, lng };
                    setMarker(newLocation);
                    
                    // Reverse geocode to get address
                    if (geocoder.current) {
                      geocoder.current.geocode({ location: newLocation }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                          const address = results[0].formatted_address;
                          onLocationSelect({ lat, lng, address });
                        }
                      });
                    }
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Click on the map to set a location</p>
          <p>• Drag the marker to adjust the position</p>
          <p>• Use the search bar to find an address</p>
          <p>• Click "Current" to use your current location</p>
        </div>
      </CardContent>
    </Card>
  );
};
