import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Autocomplete, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore, India

const LocationPicker = ({ onLocationSelect, pushToDatabase }) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const reverseGeocode = ({ lat, lng }) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          const address = data.results[0].formatted_address;
          setSelectedLocation(address);
          onLocationSelect(address);
        }
      })
      .catch((error) => console.error("Error fetching address:", error));
  };

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setMapCenter(location);
        setMarkerPosition(location);
        setSelectedLocation(place.formatted_address || place.name);
        onLocationSelect(place.formatted_address || place.name);
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="location-picker">
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceSelect}>
          <input
            type="text"
            placeholder="Enter location..."
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="location-input"
          />
        </Autocomplete>

        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15}>
          <Marker position={markerPosition} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default LocationPicker;
