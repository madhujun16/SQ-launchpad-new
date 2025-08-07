# Google Maps Integration Setup

## Overview
The application now includes a functional Google Maps location picker for selecting site locations. This feature allows users to:
- Search for addresses
- Click on the map to set locations
- Use current location
- Drag markers to adjust positions
- Get reverse geocoded addresses

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables
Create a `.env` file in the root directory with your API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Features
- **Interactive Map**: Click anywhere on the map to set a location
- **Search Functionality**: Enter addresses or postcodes to search
- **Current Location**: Use device GPS to get current location
- **Draggable Markers**: Drag the marker to fine-tune the position
- **Reverse Geocoding**: Automatically get the address from coordinates
- **Coordinate Display**: Shows latitude and longitude with 6 decimal places

### 4. Usage
The location picker is integrated into the Site Creation form and provides:
- Real-time location selection
- Address validation
- Coordinate precision
- User-friendly interface

### 5. Security Notes
- Always restrict your API key to specific domains
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting for production use

## Troubleshooting
- If the map doesn't load, check your API key and ensure the required APIs are enabled
- For location services, ensure HTTPS is used in production
- Check browser console for any JavaScript errors
