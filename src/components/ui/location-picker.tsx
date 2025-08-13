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

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className
}) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<LocationIQSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // LocationIQ reverse geocoding function
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      setError(null);
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
      setError('Failed to get address for coordinates');
      return `${lat}, ${lng}`;
    }
  }, []);

  // LocationIQ forward geocoding function
  const forwardGeocode = useCallback(async (address: string): Promise<{ lat: number; lng: number; address: string } | null> => {
    try {
      setError(null);
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
      setError('Failed to search for location');
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
      setError(null);
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
      setError('Failed to get search suggestions');
      return [];
    }
  }, []);

  const handleSearchInputChange = useCallback(async (value: string) => {
    try {
      setSearchAddress(value);
      setError(null);
      
      if (value.trim().length >= 3) {
        const suggestions = await getSearchSuggestions(value);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error handling search input change:', error);
      setError('Failed to process search input');
    }
  }, [getSearchSuggestions]);

  const handleSuggestionSelect = useCallback(async (suggestion: LocationIQSearchResult) => {
    try {
      setError(null);
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
      
      onLocationSelect(location);
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      setError('Failed to select location');
    }
  }, [onLocationSelect]);

  const handleSearch = useCallback(async () => {
    if (!searchAddress.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const location = await forwardGeocode(searchAddress);
      
      if (location) {
        const newLocation = { lat: location.lat, lng: location.lng };
        setMarker(newLocation);
        
        onLocationSelect(location);
        setSearchAddress(location.address);
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchAddress, onLocationSelect, forwardGeocode]);

  const handleCurrentLocation = useCallback(async () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newLocation = { lat, lng };
            
            setMarker(newLocation);
            
            // Use LocationIQ for reverse geocoding
            const address = await reverseGeocode(lat, lng);
            onLocationSelect({ lat, lng, address });
            setSearchAddress(address);
          } catch (error) {
            console.error('Error processing current location:', error);
            setError('Failed to process current location');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setIsLoading(false);
          console.error('Error getting current location:', error);
          setError('Failed to get current location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, [onLocationSelect, reverseGeocode]);

  // Manual coordinate input fallback
  const [manualLat, setManualLat] = useState(initialLocation?.lat.toString() || '');
  const [manualLng, setManualLng] = useState(initialLocation?.lng.toString() || '');
  const [manualAddress, setManualAddress] = useState('');

  const handleManualLocationSubmit = async () => {
    try {
      setError(null);
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const address = manualAddress || await reverseGeocode(lat, lng);
        const location = { lat, lng, address };
        onLocationSelect(location);
        setMarker({ lat, lng });
      } else {
        setError('Please enter valid coordinates');
      }
    } catch (error) {
      console.error('Error setting manual location:', error);
      setError('Failed to set manual location');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Location Picker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

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

        {/* Current Location Display */}
        {marker && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Selected Location</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Coordinates:</span>
                <span className="text-sm text-gray-600">
                  {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                </span>
              </div>
              {searchAddress && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {searchAddress}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Use the search bar to find locations by address or postcode</p>
          <p>• Click "Current" to use your current location</p>
          <p>• Or manually enter coordinates below</p>
        </div>
      </CardContent>
    </Card>
  );
};
