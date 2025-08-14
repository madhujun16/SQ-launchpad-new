import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOCATIONIQ_API_KEY = Deno.env.get('LOCATIONIQ_API_KEY');
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOCATIONIQ_API_KEY) {
      console.error('LocationIQ API key not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, query, lat, lng, limit = 5 } = await req.json();

    let url: string;
    let result: any;

    switch (action) {
      case 'search':
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required for search' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        url = `${LOCATIONIQ_BASE_URL}/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&limit=${limit}`;
        break;

      case 'reverse':
        if (lat === undefined || lng === undefined) {
          return new Response(
            JSON.stringify({ error: 'Latitude and longitude required for reverse geocoding' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        url = `${LOCATIONIQ_BASE_URL}/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use "search" or "reverse"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Geocoding ${action} request:`, { query, lat, lng, limit });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`LocationIQ API error: ${response.status} ${response.statusText}`);
      throw new Error(`LocationIQ API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Geocoding ${action} successful`);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in geocoding function:', error);
    return new Response(
      JSON.stringify({ error: 'Geocoding request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});