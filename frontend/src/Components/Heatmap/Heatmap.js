import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapOverlay from 'leaflet-heatmap';
import axios from 'axios';

const Heatmap = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch geo-tagged report locations from the backend API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/report-locations`);
        setDataPoints(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load heatmap data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (dataPoints.length === 0 || loading) return; // Don't proceed if there's no data or still loading

    // Initialize the map - center on first point or default to center of India
    const defaultCenter = [20.5937, 78.9629]; // Default center (India)
    const initialCenter = dataPoints.length > 0 
      ? [dataPoints[0].lat, dataPoints[0].lng] 
      : defaultCenter;
    
    const map = L.map('map').setView(initialCenter, 10); // Closer zoom for local view

    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Find the maximum report count for normalization
    const maxReports = Math.max(...dataPoints.map(point => point.reports));

    // Convert data points to heatmap format (adjusting intensity based on report count)
    const heatmapData = {
      max: maxReports,
      data: dataPoints.map(point => ({
        lat: point.lat,
        lng: point.lng,
        count: point.reports
      }))
    };

    // Create the heatmap overlay with options
    const heatmapLayer = new HeatmapOverlay({
      radius: 30, // Radius of 30km (in pixels at current zoom level)
      maxOpacity: 0.8,
      minOpacity: 0.1,
      blur: 0.85,
      gradient: {
        0.4: 'blue',   // Low intensity
        0.6: 'lime',   // Medium intensity
        0.8: 'yellow', // High intensity
        1.0: 'red'     // Very high intensity
      }
    });

    // Add the heatmap data to the map
    heatmapLayer.setData(heatmapData);
    map.addLayer(heatmapLayer);

    // Add markers with location information
    dataPoints.forEach(point => {
      L.marker([point.lat, point.lng])
        .addTo(map)
        .bindPopup(`
          <strong>Location:</strong> ${point.location}<br>
          <strong>Reports:</strong> ${point.reports}
        `);
    });

    // Fit the map to show all points
    if (dataPoints.length > 1) {
      const bounds = L.latLngBounds(dataPoints.map(point => [point.lat, point.lng]));
      map.fitBounds(bounds);
    }

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [dataPoints, loading]);

  if (loading) return <div>Loading heatmap data...</div>;
  if (error) return <div>{error}</div>;
  if (dataPoints.length === 0) return <div>No location data available</div>;

  return (
    <div style={{ height: '100vh' }}>
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default Heatmap;