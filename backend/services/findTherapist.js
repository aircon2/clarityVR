import { Client } from "@googlemaps/google-maps-services-js";
import 'dotenv/config';

const client = new Client({});

async function findTherapists() {
  try {
    
    const response = await client.textSearch({
      params: {
        query: "therapist",
        type: "health",
        location: { lat: 40.7128, lng: -74.0060 },
        radius: 5000,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    console.log("✅ Raw Google Places results:", response.data.results);

    const simplified = response.data.results.map((p) => ({
      name: p.name,
      rating: p.rating || "N/A",
      address: p.formatted_address,
    }));

    console.log("📋 Simplified therapist list:", simplified);
    return simplified;
    } catch (err) {
      console.error(err.response?.data || err.message);
      return [];
    }
}

findTherapists();