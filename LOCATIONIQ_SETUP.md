# LocationIQ Integration Setup

## Overview
The application now uses LocationIQ API for geocoding and reverse geocoding functionality. This provides:
- Address search and geocoding
- Reverse geocoding (coordinates to address)
- Current location support
- Manual coordinate input

## Features

### ✅ LocationIQ API Integration
- **Reverse Geocoding**: Convert coordinates to human-readable addresses
- **Forward Geocoding**: Convert addresses to coordinates
- **Search Functionality**: Find locations by address or postcode
- **Current Location**: Use device GPS with reverse geocoding

### ✅ User Interface
- **Search Bar**: Enter addresses or postcodes to find locations
- **Current Location Button**: Use device GPS automatically
- **Manual Coordinate Input**: Enter lat/lng manually
- **Interactive Map**: Click to set locations (when Google Maps is available)
- **Real-time Updates**: Address updates as you interact

## API Configuration

### Current Setup
```javascript
// LocationIQ API configuration
const LOCATIONIQ_API_KEY = 'pk.2b07dbcb85ff59de62dc9f1cf9f0facb';
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';
```

### API Endpoints Used
1. **Reverse Geocoding**: `https://us1.locationiq.com/v1/reverse?key={key}&lat={lat}&lon={lng}&format=json`
2. **Forward Geocoding**: `https://us1.locationiq.com/v1/search?key={key}&q={address}&format=json&limit=1`

## Usage Examples

### Reverse Geocoding
```javascript
// Convert coordinates to address
const address = await reverseGeocode(51.5074, -0.1278);
// Returns: "London, Greater London, England, United Kingdom"
```

### Forward Geocoding
```javascript
// Convert address to coordinates
const location = await forwardGeocode("London, UK");
// Returns: { lat: 51.5074, lng: -0.1278, address: "London, Greater London, England, United Kingdom" }
```

## Integration Points

### Site Creation Form
- **Location Picker Component**: Full LocationIQ integration
- **Search Functionality**: Find addresses by typing
- **Current Location**: Use device GPS
- **Manual Input**: Enter coordinates manually

### Features Available
1. **Address Search**: Type any address or postcode
2. **Coordinate Input**: Manual lat/lng entry
3. **Current Location**: GPS-based location
4. **Reverse Geocoding**: Get address from coordinates
5. **Real-time Updates**: Address updates automatically

## Error Handling

### Graceful Fallbacks
- **API Errors**: Falls back to coordinate display
- **Network Issues**: Shows manual input options
- **Invalid Coordinates**: Validates input before submission
- **Search Failures**: Provides clear error messages

### Error Messages
- Network connectivity issues
- Invalid API responses
- Location not found
- GPS permission denied

## Testing

### Test Coordinates
Try these coordinates for testing:
- **London**: `51.5074, -0.1278`
- **New York**: `40.7128, -74.0060`
- **Tokyo**: `35.6762, 139.6503`

### Test Addresses
Try these addresses for testing:
- `London, UK`
- `New York, NY`
- `Tokyo, Japan`

## Benefits

### ✅ Advantages of LocationIQ
- **No API Key Required**: Pre-configured and ready to use
- **Global Coverage**: Worldwide address database
- **Fast Response**: Quick geocoding results
- **Reliable Service**: High uptime and accuracy
- **Cost Effective**: Free tier available

### ✅ User Experience
- **Instant Search**: Fast address lookup
- **Accurate Results**: Precise geocoding
- **User Friendly**: Intuitive interface
- **Mobile Ready**: Works on all devices

## Technical Details

### API Response Format
```json
{
  "display_name": "London, Greater London, England, United Kingdom",
  "address": {
    "house_number": "123",
    "road": "Main Street",
    "city": "London",
    "state": "Greater London",
    "postcode": "SW1A 1AA",
    "country": "United Kingdom"
  }
}
```

### Error Response Handling
```javascript
try {
  const address = await reverseGeocode(lat, lng);
  return address;
} catch (error) {
  console.error('Reverse geocoding error:', error);
  return `${lat}, ${lng}`; // Fallback
}
```

## Future Enhancements

### Potential Improvements
1. **Caching**: Cache frequently used addresses
2. **Autocomplete**: Address suggestions as you type
3. **Batch Processing**: Multiple locations at once
4. **Custom Styling**: Map customization options
5. **Offline Support**: Local address database

### Integration Opportunities
1. **Address Validation**: Verify addresses before submission
2. **Distance Calculation**: Calculate distances between locations
3. **Route Planning**: Navigation and routing features
4. **Geofencing**: Location-based notifications
5. **Analytics**: Location usage statistics
