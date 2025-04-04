import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapOverlay from 'leaflet-heatmap';
import './Dashboard.css';

const Dashboard = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stats, setStats] = useState({
    totalIssues: 0,
    avgResponseTime: 0,
    openIssues: 0,
    resolutionRate: 0
  });

  // Fetch report data and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add error handling and timeout for each request
        const locationPromise = axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/report-locations`)
          .catch(err => {
            console.error('Error fetching locations:', err);
            throw new Error('Failed to fetch location data');
          });
          
        const reportsPromise = axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`)
          .catch(err => {
            console.error('Error fetching reports:', err);
            throw new Error('Failed to fetch reports data');
          });
        
        // Use Promise.all to fetch both datasets concurrently
        const [locationResponse, reportsResponse] = await Promise.all([
          locationPromise,
          reportsPromise
        ]);
        
        // Safety check for empty responses
        if (!locationResponse.data || !reportsResponse.data) {
          throw new Error('Received empty data from API');
        }
        
        console.log('Location data:', locationResponse.data);
        console.log('Reports data:', reportsResponse.data);
        
        // Process location data to include images from corresponding reports
        const locationData = locationResponse.data.map(location => {
          // Find all reports that match this location
          const matchingReports = reportsResponse.data.filter(report => 
            report.location === location.location
          );
          
          // Extract images from matching reports
          const images = matchingReports.reduce((allImages, report) => {
            if (report.images && report.images.length) {
              return [...allImages, ...report.images];
            }
            return allImages;
          }, []);
          
          // Return enhanced location data with images
          return {
            ...location,
            images: images,
            matchingReports: matchingReports,
            // Ensure lat/lng are numbers
            lat: parseFloat(location.lat) || 0,
            lng: parseFloat(location.lng) || 0
          };
        });
        
        // Filter out invalid locations
        const validLocationData = locationData.filter(loc => 
          !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0
        );
        
        if (validLocationData.length === 0) {
          setError('No valid location data available');
          setLoading(false);
          return;
        }
        
        // Set data points with image information
        setDataPoints(validLocationData);
        
        // Calculate statistics from the reports data
        const reports = reportsResponse.data;
        const totalIssues = reports.length;
        
        // Calculate statistics
        const openIssues = reports.filter(report => report.status !== 'closed').length;
        const resolvedIssues = reports.filter(report => report.status === 'closed').length;
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
        
        // Calculate average response time
        let totalResponseTime = 0;
        let reportsWithResponse = 0;
        
        reports.forEach(report => {
          if (report.firstResponse && report.createdAt) {
            const responseTime = (new Date(report.firstResponse) - new Date(report.createdAt)) / (1000 * 60 * 60 * 24); // in days
            totalResponseTime += responseTime;
            reportsWithResponse++;
          }
        });
        
        const avgResponseTime = reportsWithResponse > 0 
          ? (totalResponseTime / reportsWithResponse).toFixed(1) 
          : 0;
        
        setStats({
          totalIssues,
          avgResponseTime,
          openIssues,
          resolutionRate
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data: ' + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize map when data is loaded
  useEffect(() => {
    if (dataPoints.length === 0 || loading) return;

    let map = null;
    
    try {
      // Remove existing map if any
      const container = L.DomUtil.get('map');
      if (container != null) {
        container._leaflet_id = null;
      }

      // Filter data points by selected category if needed
      const filteredPoints = selectedCategory === 'All Categories' 
        ? dataPoints 
        : dataPoints.filter(point => {
            // Check if any matching reports have the selected category
            if (point.matchingReports) {
              return point.matchingReports.some(report => 
                report.issueCategory === selectedCategory
              );
            }
            return point.category === selectedCategory;
          });

      if (filteredPoints.length === 0) {
        console.log('No points to display for selected category');
        return; // Skip map creation if no points match
      }

      // Initialize map centered on first point or default to center of India
      const initialCenter = filteredPoints.length > 0 
        ? [filteredPoints[0].lat, filteredPoints[0].lng] 
        : [20.5937, 78.9629]; // Default to center of India
        
      map = L.map('map').setView(initialCenter, 5); // Start with a wider zoom level

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Find max report count for normalization
      const maxReports = Math.max(...filteredPoints.map(point => point.reports || 1));

      // Configure heatmap data
      const heatmapData = {
        max: maxReports,
        data: filteredPoints.map(point => ({
          lat: point.lat,
          lng: point.lng,
          count: point.reports || 1
        }))
      };

      // Create heatmap layer with adjustable radius
      const heatmapLayer = new HeatmapOverlay({
        radius: 30,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        blur: 0.85,
        gradient: {
          0.4: 'blue',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      });

      // Add heatmap to map
      heatmapLayer.setData(heatmapData);
      map.addLayer(heatmapLayer);

      // Add markers with popups
      filteredPoints.forEach(point => {
        const marker = L.marker([point.lat, point.lng]).addTo(map);
        
        // Create popup content with images if available
        let popupContent = `
          <div class="popup-content">
            <strong>Location:</strong> ${point.location || 'Unknown'}<br>
            <strong>Reports:</strong> ${point.reports || 0}
        `;
        
        // Add images to popup if available
        if (point.images && point.images.length) {
          popupContent += `
            <div class="popup-images">
              <h4>Reported Images:</h4>
              <div class="image-gallery">
          `;
          
          // Add up to 3 images to avoid overcrowding the popup
          const imagesToShow = point.images.slice(0, 3);
          imagesToShow.forEach(image => {
            const imageUrl = `${process.env.REACT_APP_API_BASE_URL}/uploads/${image}`;
            popupContent += `
              <img src="${imageUrl}" alt="Report Image" class="popup-image" />
            `;
          });
          
          // Add text if there are more images
          if (point.images.length > 3) {
            popupContent += `<p>+${point.images.length - 3} more images</p>`;
          }
          
          popupContent += `
              </div>
            </div>
          `;
        }
        
        // Add a list of report categories if there are multiple reports at this location
        if (point.matchingReports && point.matchingReports.length > 1) {
          popupContent += `
            <div class="report-categories">
              <h4>Issue Categories:</h4>
              <ul>
          `;
          
          // Get unique categories
          const categories = [...new Set(point.matchingReports
            .map(report => report.issueCategory)
            .filter(Boolean))];
            
          categories.forEach(category => {
            popupContent += `<li>${category}</li>`;
          });
          
          popupContent += `
              </ul>
            </div>
          `;
        }
        
        popupContent += `</div>`;
        
        // Bind the popup with custom CSS
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });
      });

      // Fit bounds if multiple points
      if (filteredPoints.length > 1) {
        const bounds = L.latLngBounds(filteredPoints.map(point => [point.lat, point.lng]));
        map.fitBounds(bounds);
      }

      // Add custom CSS for popups
      const style = document.createElement('style');
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .popup-content {
          padding: 5px;
        }
        
        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }
        
        .popup-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .report-categories ul {
          margin: 5px 0;
          padding-left: 20px;
        }
      `;
      document.head.appendChild(style);
    } catch (mapError) {
      console.error('Error initializing map:', mapError);
      setError('Failed to initialize map: ' + mapError.message);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [dataPoints, loading, selectedCategory]);

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Calculate severity class
  const getSeverityClass = (count) => {
    if (!count || count < 5) return 'low-severity';
    if (count < 10) return 'medium-severity';
    return 'high-severity';
  };

  // Get unique categories from the data for dynamic filtering
  const getUniqueCategories = () => {
    const allCategories = new Set(['All Categories']);
    
    // Extract categories from matching reports
    dataPoints.forEach(point => {
      if (point.matchingReports) {
        point.matchingReports.forEach(report => {
          if (report.issueCategory) {
            allCategories.add(report.issueCategory);
          }
        });
      }
      
      // Also add the point's category if it exists
      if (point.category) {
        allCategories.add(point.category);
      }
    });
    
    return Array.from(allCategories);
  };
  
  const categories = getUniqueCategories();

  if (loading) return (
    <div className="dashboard loading-container">
      <div className="loading-indicator">Loading dashboard data...</div>
    </div>
  );

  if (error) return (
    <div className="dashboard error-container">
      <div className="error-message">{error}</div>
      <button 
        onClick={() => window.location.reload()} 
        className="retry-button"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Issue Severity</h2>
        <ul className="severity-legend">
          <li className="low-severity">Low (1-5 reports)</li>
          <li className="medium-severity">Medium (5-10 reports)</li>
          <li className="high-severity">High (10+ reports)</li>
        </ul>
        
        <h2>Filter by Category</h2>
        <ul className="category-filter">
          {categories.map((category, index) => (
            <li 
              key={index}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </li>
          ))}
        </ul>
        
        <div className="stats">
          <h2>Issue Overview</h2>
          <table>
            <tbody>
              <tr>
                <th>TOTAL ISSUES</th>
                <th>AVG. RESPONSE TIME</th>
              </tr>
              <tr>
                <td>{stats.totalIssues}</td>
                <td>{stats.avgResponseTime} days</td>
              </tr>
            </tbody>
          </table>
          
          <table>
            <tbody>
              <tr>
                <th>OPEN ISSUES</th>
                <th>RESOLUTION RATE</th>
              </tr>
              <tr>
                <td>{stats.openIssues}</td>
                <td>{stats.resolutionRate}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="hotspot-list">
          <h2>Hotspot Areas</h2>
          {dataPoints.length > 0 ? (
            <ul>
              {dataPoints
                .sort((a, b) => (b.reports || 0) - (a.reports || 0))
                .slice(0, 5)
                .map((point, index) => (
                  <li key={index} className={getSeverityClass(point.reports)}>
                    {(point.location && point.location.split(',')[0]) || 'Unknown'} - {point.reports || 0} reports
                    {point.images && point.images.length > 0 && (
                      <span className="has-images"> (Has Images)</span>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p>No hotspot data available</p>
          )}
        </div>
      </div>
      
      {/* Map Container */}
      <div className="map-container">
        <div id="map"></div>
      </div>
    </div>
  );
};

export default Dashboard;