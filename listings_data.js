// listings_data.js
// Mock inventory of holiday rentals for HomeToGo DecideRight prototype

const listingsData = [
  {
    id: 1,
    title: "Villa Vista Mar - Cliffside Sanctuary",
    neighborhood: "Cala d'Or",
    destination: "Mallorca",
    price: 135,
    averageNeighborhoodPrice: 170, // 20.5% below average
    rating: 4.85,
    cleanlinessScore: 4.9,
    occupancyRate: 0.95, // Historically low vacancy (Rare Find candidate)
    partner: "Booking.com",
    partnerPriceOnCompetitor: 155, // 135 is Best Price Guarantee candidate
    amenities: ["Private Pool", "Sea View", "AC", "Kid-Friendly"],
    maxGuests: 6,
    bedrooms: 3,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 2,
    title: "Cozy Stone Finca & Gardens",
    neighborhood: "Sóller",
    destination: "Mallorca",
    price: 190,
    averageNeighborhoodPrice: 185,
    rating: 4.92,
    cleanlinessScore: 4.95,
    occupancyRate: 0.98, // High occupancy (Rare Find candidate)
    partner: "Vrbo",
    partnerPriceOnCompetitor: 190,
    amenities: ["Mountain View", "Private Pool", "Fireplace", "Kid-Friendly"],
    maxGuests: 8,
    bedrooms: 4,
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 3,
    title: "Chic Marina Penthouse",
    neighborhood: "Palma Center",
    destination: "Mallorca",
    price: 110,
    averageNeighborhoodPrice: 140, // 21.4% below average
    rating: 4.65,
    cleanlinessScore: 4.5,
    occupancyRate: 0.70,
    partner: "Booking.com",
    partnerPriceOnCompetitor: 110,
    amenities: ["Balcony", "AC", "Wifi", "Walkable"],
    maxGuests: 2,
    bedrooms: 1,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 4,
    title: "Traditional Country Estate",
    neighborhood: "Pollença",
    destination: "Mallorca",
    price: 250,
    averageNeighborhoodPrice: 260,
    rating: 4.78,
    cleanlinessScore: 4.8,
    occupancyRate: 0.88,
    partner: "Tripadvisor",
    partnerPriceOnCompetitor: 275, // Best Price Guarantee candidate
    amenities: ["Private Pool", "BBQ", "Kid-Friendly", "Large Garden"],
    maxGuests: 10,
    bedrooms: 5,
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 5,
    title: "Modern Seafront Apartment",
    neighborhood: "Cala Millor",
    destination: "Mallorca",
    price: 95,
    averageNeighborhoodPrice: 115, // 17.3% below average
    rating: 4.70,
    cleanlinessScore: 4.75,
    occupancyRate: 0.85,
    partner: "Agoda",
    partnerPriceOnCompetitor: 95,
    amenities: ["Beachfront", "AC", "Wifi", "Elevator"],
    maxGuests: 4,
    bedrooms: 2,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 6,
    title: "Romantic Olive Grove Cottage",
    neighborhood: "Deià",
    destination: "Mallorca",
    price: 160,
    averageNeighborhoodPrice: 200, // 20% below average
    rating: 4.95,
    cleanlinessScore: 4.98,
    occupancyRate: 0.96, // Rare Find candidate
    partner: "Vrbo",
    partnerPriceOnCompetitor: 165,
    amenities: ["Mountain View", "Fireplace", "Wifi", "Terrace"],
    maxGuests: 2,
    bedrooms: 1,
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 7,
    title: "Family Finca with Trampoline",
    neighborhood: "Sóller",
    destination: "Mallorca",
    price: 210,
    averageNeighborhoodPrice: 220,
    rating: 4.82,
    cleanlinessScore: 4.70,
    occupancyRate: 0.89,
    partner: "Booking.com",
    partnerPriceOnCompetitor: 210,
    amenities: ["Private Pool", "Trampoline", "Kid-Friendly", "AC"],
    maxGuests: 6,
    bedrooms: 3,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 8,
    title: "Minimalist Ocean-View Oasis",
    neighborhood: "Cala d'Or",
    destination: "Mallorca",
    price: 320,
    averageNeighborhoodPrice: 340,
    rating: 4.88,
    cleanlinessScore: 4.90,
    occupancyRate: 0.91,
    partner: "Vrbo",
    partnerPriceOnCompetitor: 340, // Best Price Guarantee candidate
    amenities: ["Private Pool", "Sea View", "Jacuzzi", "AC"],
    maxGuests: 4,
    bedrooms: 2,
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"]
  },
  // Tuscany Listings
  {
    id: 9,
    title: "Rustic Stone Villa with Vineyard Views",
    neighborhood: "Siena Hills",
    destination: "Tuscany",
    price: 145,
    averageNeighborhoodPrice: 190, // 23.7% below average
    rating: 4.90,
    cleanlinessScore: 4.85,
    occupancyRate: 0.97, // Rare Find candidate
    partner: "Vrbo",
    partnerPriceOnCompetitor: 145,
    amenities: ["Private Pool", "Mountain View", "Fireplace", "Kid-Friendly"],
    maxGuests: 8,
    bedrooms: 4,
    images: ["https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 10,
    title: "Charming Renaissance Apartment",
    neighborhood: "Florence Center",
    destination: "Tuscany",
    price: 85,
    averageNeighborhoodPrice: 110, // 22.7% below average
    rating: 4.75,
    cleanlinessScore: 4.80,
    occupancyRate: 0.75,
    partner: "Booking.com",
    partnerPriceOnCompetitor: 98, // Best Price Guarantee candidate (85 vs 98)
    amenities: ["Balcony", "AC", "Wifi", "Walkable"],
    maxGuests: 2,
    bedrooms: 1,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = listingsData;
}
