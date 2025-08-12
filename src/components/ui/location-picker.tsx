import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

// Try to import Google Maps components, but handle gracefully if not available
let GoogleMap: React.ComponentType<{ children?: React.ReactNode; [key: string]: unknown }> | null = null;
let useJsApiLoader: ((config: { id: string; googleMapsApiKey: string; libraries: ('places' | 'geometry' | 'drawing' | 'visualization')[] }) => { isLoaded: boolean }) | null = null;
let Marker: React.ComponentType<{ position: { lat: number; lng: number } | google.maps.LatLng | google.maps.LatLngLiteral; [key: string]: unknown }> | null = null;

try {
  // Use dynamic import instead of require
  import('@react-google-maps/api').then((module) => {
    GoogleMap = module.GoogleMap;
    useJsApiLoader = module.useJsApiLoader;
    Marker = module.Marker;
  }).catch((error) => {
    console.warn('Google Maps API not available:', error);
  });
} catch (error) {
  console.warn('Google Maps API not available:', error);
}

// LocationIQ API configuration
const LOCATIONIQ_API_KEY = 'pk.2b07dbcb85ff59de62dc9f1cf9f0facb';
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';

interface LocationIQResponse {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface LocationIQSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<LocationIQSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if Google Maps API key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleMapsAvailable = GoogleMap && useJsApiLoader && apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  // Conditional hook usage - move outside of conditional
  const googleMapsLoader = useJsApiLoader || (() => ({ isLoaded: false }));
  const { isLoaded } = googleMapsLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || 'YOUR_API_KEY_HERE',
    libraries: ['places']
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
    
    if (initialLocation) {
      mapInstance.setCenter(initialLocation);
      setMarker(initialLocation);
    }
  }, [initialLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // LocationIQ reverse geocoding function
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `${LOCATIONIQ_BASE_URL}/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LocationIQResponse = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  }, []);

  // LocationIQ forward geocoding function
  const forwardGeocode = useCallback(async (address: string): Promise<{ lat: number; lng: number; address: string } | null> => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${LOCATIONIQ_BASE_URL}/search?key=${LOCATIONIQ_API_KEY}&q=${encodedAddress}&format=json&limit=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
          address: location.display_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Forward geocoding error:', error);
      return null;
    }
  }, []);

  // LocationIQ search suggestions function
  const getSearchSuggestions = useCallback(async (query: string): Promise<LocationIQSearchResult[]> => {
    if (!query.trim() || query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${LOCATIONIQ_BASE_URL}/search?key=${LOCATIONIQ_API_KEY}&q=${encodedQuery}&format=json&limit=5`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }, []);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newLocation = { lat, lng };
      
      setMarker(newLocation);
      
      // Use LocationIQ for reverse geocoding
      const address = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address });
    }
  }, [onLocationSelect, reverseGeocode]);

  const handleSearchInputChange = useCallback(async (value: string) => {
    setSearchAddress(value);
    
    if (value.trim().length >= 3) {
      const suggestions = await getSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [getSearchSuggestions]);

  const handleSuggestionSelect = useCallback(async (suggestion: LocationIQSearchResult) => {
    const location = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      address: suggestion.display_name
    };
    
    setSearchAddress(suggestion.display_name);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    
    const newLocation = { lat: location.lat, lng: location.lng };
    setMarker(newLocation);
    
    if (map) {
      map.setCenter(newLocation);
      map.setZoom(15);
    }
    
    onLocationSelect(location);
  }, [map, onLocationSelect]);

  const handleSearch = useCallback(async () => {
    if (!searchAddress.trim()) return;
    
    setIsLoading(true);
    try {
      const location = await forwardGeocode(searchAddress);
      
      if (location) {
        const newLocation = { lat: location.lat, lng: location.lng };
        setMarker(newLocation);
        
        if (map) {
          map.setCenter(newLocation);
          map.setZoom(15);
        }
        
        onLocationSelect(location);
        setSearchAddress(location.address);
      } else {
        // Show error message
        console.error('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchAddress, map, onLocationSelect, forwardGeocode]);

  const handleCurrentLocation = useCallback(async () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newLocation = { lat, lng };
          
          setMarker(newLocation);
          
          if (map) {
            map.setCenter(newLocation);
            map.setZoom(15);
          }
          
          // Use LocationIQ for reverse geocoding
          const address = await reverseGeocode(lat, lng);
          onLocationSelect({ lat, lng, address });
          setSearchAddress(address);
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [map, onLocationSelect, reverseGeocode]);

  // Manual coordinate input fallback
  const [manualLat, setManualLat] = useState(initialLocation?.lat.toString() || '');
  const [manualLng, setManualLng] = useState(initialLocation?.lng.toString() || '');
  const [manualAddress, setManualAddress] = useState('');

  const handleManualLocationSubmit = async () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const address = manualAddress || await reverseGeocode(lat, lng);
      const location = { lat, lng, address };
      onLocationSelect(location);
      setMarker({ lat, lng });
    }
  };

  // If Google Maps is not available, show LocationIQ interface
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
          {/* Search functionality */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Search Location</h4>
            <div className="relative flex space-x-2">
              <div className="flex-1 relative" ref={searchRef}>
                <Input
                  placeholder="Enter address or postcode..."
                  value={searchAddress}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="text-sm font-medium text-gray-900">{suggestion.display_name}</div>
                        {suggestion.address.city && (
                          <div className="text-xs text-gray-500">
                            {suggestion.address.city}
                            {suggestion.address.state && `, ${suggestion.address.state}`}
                            {suggestion.address.postcode && ` ${suggestion.address.postcode}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        <div className="relative flex space-x-2">
          <div className="flex-1 relative" ref={searchRef}>
            <Input
              placeholder="Enter address or postcode..."
              value={searchAddress}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="text-sm font-medium text-gray-900">{suggestion.display_name}</div>
                    {suggestion.address.city && (
                      <div className="text-xs text-gray-500">
                        {suggestion.address.city}
                        {suggestion.address.state && `, ${suggestion.address.state}`}
                        {suggestion.address.postcode && ` ${suggestion.address.postcode}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
                onDragEnd={async (e: google.maps.MapMouseEvent) => {
                  if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    const newLocation = { lat, lng };
                    setMarker(newLocation);
                    
                    // Use LocationIQ for reverse geocoding
                    const address = await reverseGeocode(lat, lng);
                    onLocationSelect({ lat, lng, address });
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Click on the map to set a location or use the search bar above</p>
          <p>• Drag the marker to adjust the position</p>
        </div>
      </CardContent>
    </Card>
  );
};
