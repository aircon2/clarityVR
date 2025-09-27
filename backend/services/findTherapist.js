import { Client } from "@googlemaps/google-maps-services-js";
import 'dotenv/config';

const client = new Client({});

function extractTherapistNameFromReviews(reviews) {
  // Regex to match "Firstname Lastname" followed by 'at'
  const nameRegex = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b(?=\s+at)/;

  for (const review of reviews) {
    const match = review.match(nameRegex);
    if (match) return match[1]; // return first matched name
  }

  return null; // fallback if no name found
}

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
      searchResponse.data.results.map(async (clinic) => {
        try {
          const detailsResponse = await client.placeDetails({
            params: {
              place_id: clinic.place_id,
              fields: ["reviews", "types"],
              key: process.env.GOOGLE_API_KEY,
            },
          });

          const details = detailsResponse.data.result;
          const reviews = details.reviews ? details.reviews.map(r => r.text) : [];
          const therapistName = extractTherapistNameFromReviews(reviews);

          const therapistData = {
            clinicName: clinic.name,
            rating: clinic.rating || "N/A",
            address: clinic.formatted_address,
            reviews,
            types: details.types || []
          };

          if (therapistName) therapistData.therapistName = therapistName;

          return therapistData;

        } catch (err) {
          console.error("Failed to fetch details for:", clinic.name, err.message);
          return {
            clinicName: clinic.name,
            rating: clinic.rating || "N/A",
            address: clinic.formatted_address,
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

// Test call
findTherapists();