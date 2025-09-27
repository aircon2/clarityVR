import { Client } from "@googlemaps/google-maps-services-js";
import 'dotenv/config';

const client = new Client({});

export async function findTherapists(lat = 40.7128, lng = -74.0060, radius = 5000) {
  try {

    const searchResponse = await client.textSearch({
      params: {
        query: "therapist",
        type: "health",
        location: { lat, lng },
        radius,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    
    const therapists = await Promise.all(
      searchResponse.data.results.map(async (p) => {
        try {
          const detailsResponse = await client.placeDetails({
            params: {
              place_id: p.place_id,
              fields: ["reviews", "types"],
              key: process.env.GOOGLE_API_KEY,
            },
          });

          const details = detailsResponse.data.result;

          return {
            name: p.name,
            rating: p.rating || "N/A",
            address: p.formatted_address,
            reviews: details.reviews ? details.reviews.map(r => r.text) : [],
            types: details.types || []
          };

        } catch (err) {
          console.error("Failed to fetch details for:", p.name, err.message);
          return {
            name: p.name,
            rating: p.rating || "N/A",
            address: p.formatted_address,
            reviews: [],
            types: []
          };
        }
      })
    );

    console.log("📝 Fetched therapists:", JSON.stringify(therapists, null, 2));
    return therapists;

  } catch (err) {
    console.error(err.response?.data || err.message);
    return [];
  }
}