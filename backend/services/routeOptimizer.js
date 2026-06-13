/**
 * Route Optimizer Service
 * Menggunakan Nearest-Neighbor TSP Heuristic + Haversine Distance
 * + OSRM integration untuk rute jalan nyata
 */

// Haversine formula - menghitung jarak antara 2 koordinat GPS (km)
function haversineDistance(coord1, coord2) {
  const R = 6371; // Radius bumi dalam km
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Estimasi waktu tempuh berdasarkan jarak (asumsi kecepatan rata-rata 30 km/h di kota)
function estimateTime(distanceKm, avgSpeedKmh = 30) {
  return (distanceKm / avgSpeedKmh) * 60; // dalam menit
}

// Nearest-Neighbor TSP Algorithm
function nearestNeighborTSP(origin, destinations) {
  const unvisited = [...destinations];
  const route = [];
  let current = origin;
  let totalDistance = 0;
  let totalDuration = 0;
  const baseTime = new Date();

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(current, unvisited[i].coordinates);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = unvisited.splice(nearestIdx, 1)[0];
    totalDistance += nearestDist;
    const segmentTime = estimateTime(nearestDist);
    totalDuration += segmentTime;

    // Tambahkan 10 menit waktu bongkar muat per drop point
    const unloadingTime = 10;
    const etaMinutes = totalDuration + (route.length * unloadingTime);
    const eta = new Date(baseTime.getTime() + etaMinutes * 60 * 1000);

    route.push({
      school: nearest.schoolId,
      schoolName: nearest.schoolName,
      location: {
        type: 'Point',
        coordinates: nearest.coordinates
      },
      order: route.length + 1,
      eta: eta,
      distanceFromPrev: Math.round(nearestDist * 100) / 100
    });

    current = nearest.coordinates;
  }

  // Build optimized path (array of coordinates)
  const optimizedPath = [origin, ...route.map(r => r.location.coordinates)];

  return {
    waypoints: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round(totalDuration + (route.length * 10)), // include unloading time
    optimizedPath,
    algorithm: 'nearest-neighbor-tsp'
  };
}

// Main optimization function
function optimizeRoute(originCoords, schools) {
  const destinations = schools.map(s => ({
    schoolId: s._id || s.schoolId,
    schoolName: s.name || s.schoolName,
    coordinates: s.location?.coordinates || s.coordinates
  }));

  return nearestNeighborTSP(originCoords, destinations);
}

/**
 * OSRM Trip API — optimasi rute via jalan nyata (gratis, OpenStreetMap)
 * Menggunakan server publik OSRM: router.project-osrm.org
 * 
 * @param {[number, number]} originCoords - [lng, lat] of kitchen/origin
 * @param {Array} schools - array of school documents
 * @returns {Object} optimized route with real road distances and polyline
 */
async function optimizeRouteOSRM(originCoords, schools) {
  if (!schools || schools.length === 0) {
    return { waypoints: [], totalDistance: 0, totalDuration: 0, optimizedPath: [], routeGeometry: null, algorithm: 'osrm-trip' };
  }

  const destinations = schools.map(s => ({
    schoolId: s._id || s.schoolId,
    schoolName: s.name || s.schoolName,
    coordinates: s.location?.coordinates || s.coordinates,
    portionsNeeded: s.portionsNeeded || s.totalStudents || 0
  }));

  // Build coordinate string: origin;school1;school2;...
  const allCoords = [originCoords, ...destinations.map(d => d.coordinates)];
  const coordStr = allCoords.map(c => `${c[0]},${c[1]}`).join(';');

  try {
    // OSRM Trip API — solves TSP
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordStr}?source=first&roundtrip=false&geometries=geojson&overview=full&annotations=distance,duration`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
      // Fallback to Haversine TSP
      console.warn('OSRM failed, falling back to Haversine TSP:', data.code);
      return optimizeRoute(originCoords, schools);
    }

    const trip = data.trips[0];
    const baseTime = new Date();

    // Map OSRM waypoints back to school data (skip index 0 = origin)
    const osrmWaypoints = data.waypoints || [];
    const orderedSchools = [];

    // The trip.legs array tells us the order of visits
    // osrmWaypoints[i].waypoint_index gives the position in the trip
    const waypointOrder = osrmWaypoints
      .map((wp, idx) => ({ originalIdx: idx, tripIdx: wp.waypoint_index }))
      .sort((a, b) => a.tripIdx - b.tripIdx);

    let cumulativeDistance = 0;
    let cumulativeDuration = 0;

    for (let i = 1; i < waypointOrder.length; i++) {
      const wpInfo = waypointOrder[i];
      const originalIdx = wpInfo.originalIdx;
      
      // originalIdx 0 = origin, so school is at originalIdx - 1
      if (originalIdx === 0) continue;
      const school = destinations[originalIdx - 1];
      if (!school) continue;

      const leg = trip.legs[i - 1];
      const legDistance = leg ? leg.distance / 1000 : 0; // meters to km
      const legDuration = leg ? leg.duration / 60 : 0; // seconds to minutes
      
      cumulativeDistance += legDistance;
      cumulativeDuration += legDuration;

      const unloadingTime = 10; // 10 min per stop
      const etaMinutes = cumulativeDuration + (orderedSchools.length * unloadingTime);
      const eta = new Date(baseTime.getTime() + etaMinutes * 60 * 1000);

      orderedSchools.push({
        school: school.schoolId,
        schoolName: school.schoolName,
        location: {
          type: 'Point',
          coordinates: school.coordinates
        },
        order: orderedSchools.length + 1,
        eta: eta,
        distanceFromPrev: Math.round(legDistance * 100) / 100
      });
    }

    // If OSRM didn't return proper ordering, fallback
    if (orderedSchools.length === 0) {
      return optimizeRoute(originCoords, schools);
    }

    // Extract route geometry (GeoJSON LineString)
    const routeGeometry = trip.geometry; // GeoJSON LineString { type, coordinates }

    return {
      waypoints: orderedSchools,
      totalDistance: Math.round((trip.distance / 1000) * 100) / 100, // km
      totalDuration: Math.round(trip.duration / 60 + orderedSchools.length * 10), // minutes + unloading
      optimizedPath: [originCoords, ...orderedSchools.map(w => w.location.coordinates)],
      routeGeometry: routeGeometry, // GeoJSON for drawing on map
      algorithm: 'osrm-trip'
    };
  } catch (error) {
    console.error('OSRM error, falling back to Haversine:', error.message);
    return optimizeRoute(originCoords, schools);
  }
}

/**
 * Multi-kitchen route optimization
 * For each kitchen: split its assigned schools across vehicles, then optimize each vehicle route
 * 
 * @param {Array} kitchens - array of kitchen docs (populated with assignedSchools, assignedVehicles)
 * @param {number} schoolsPerVehicle - max schools per vehicle
 * @param {boolean} useOSRM - whether to use OSRM for real road routing
 * @returns {Array} array of kitchenRoute objects
 */
async function optimizeMultiKitchenRoutes(kitchens, schoolsPerVehicle = 3, useOSRM = true) {
  const results = [];

  for (const kitchen of kitchens) {
    const kitchenCoords = kitchen.location.coordinates;
    const schools = kitchen.assignedSchools || [];
    const vehicles = (kitchen.assignedVehicles || []).filter(v => v.status === 'available');

    const vehicleRoutes = [];
    const schoolsCopy = [...schools];

    for (let i = 0; i < vehicles.length && schoolsCopy.length > 0; i++) {
      const assigned = schoolsCopy.splice(0, schoolsPerVehicle);
      
      let routeResult;
      if (useOSRM && assigned.length > 0) {
        routeResult = await optimizeRouteOSRM(kitchenCoords, assigned);
      } else {
        routeResult = optimizeRoute(kitchenCoords, assigned);
      }

      vehicleRoutes.push({
        vehicle: vehicles[i],
        schools: assigned,
        route: routeResult
      });
    }

    // Remaining schools without vehicle
    if (schoolsCopy.length > 0) {
      let routeResult;
      if (useOSRM) {
        routeResult = await optimizeRouteOSRM(kitchenCoords, schoolsCopy);
      } else {
        routeResult = optimizeRoute(kitchenCoords, schoolsCopy);
      }
      vehicleRoutes.push({
        vehicle: null,
        schools: schoolsCopy,
        route: routeResult
      });
    }

    results.push({
      kitchen: {
        _id: kitchen._id,
        name: kitchen.name,
        code: kitchen.code,
        location: kitchen.location,
        address: kitchen.address
      },
      totalSchools: schools.length,
      totalPortions: schools.reduce((sum, s) => sum + (s.portionsNeeded || s.totalStudents || 0), 0),
      vehicleRoutes
    });
  }

  return results;
}

module.exports = { optimizeRoute, optimizeRouteOSRM, optimizeMultiKitchenRoutes, haversineDistance, estimateTime };
