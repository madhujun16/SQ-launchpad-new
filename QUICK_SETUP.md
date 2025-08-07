# Quick Google Maps Setup Guide

## 🚀 Get Google Maps Working in 5 Minutes

### Step 1: Get Your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### Step 2: Add API Key to Project
Create a `.env` file in your project root (same folder as package.json):

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Replace `your_actual_api_key_here` with your real API key**

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test
1. Go to any site detail page
2. Click on "Site Creation" step
3. You should see the interactive Google Maps

## 🔧 Troubleshooting

### If you see "Google Maps API Key Required":
- Make sure you created the `.env` file
- Check that the API key is correct
- Restart the development server

### If the map doesn't load:
- Check browser console for errors
- Verify your API key has the required permissions
- Make sure you enabled all 3 APIs listed above

### If you get billing errors:
- Google Maps requires billing to be enabled
- Add a payment method to your Google Cloud account

## 📱 Fallback Mode
If you don't have an API key yet, the app will show a manual coordinate input form where you can:
- Enter latitude and longitude manually
- Add an optional address
- Set the location without the interactive map

## 🎯 Quick Test
Try entering these coordinates in manual mode:
- Latitude: `51.5074`
- Longitude: `-0.1278`
- Address: `London, UK`

This will set a location in London for testing.
