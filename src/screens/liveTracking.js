import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your server URL

// Custom hook to handle locations and map logic
const useMapLocations = (setMapCenter, setZoom) => {
    const [locations, setLocations] = useState({});
    const [loading, setLoading] = useState(true);

    const loadStoredLocations = useCallback(() => {
        const storedLocations = {};
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('lastlocation')) {
                try {
                    const userId = key.replace('lastlocation', '');
                    const storedData = JSON.parse(localStorage.getItem(key));
                    if (storedData?.latitude && storedData?.longitude) {
                        storedLocations[userId] = storedData;
                    }
                } catch (error) {
                    console.error(`Error parsing localStorage item ${key}:`, error);
                }
            }
        });
        return storedLocations;
    }, []);

    const fetchInitialLocations = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/users/location/users');
            const initialLocations = response.data;

            const updatedLocations = initialLocations.reduce((acc, loc) => {
                acc[loc.userId] = {
                    name: loc.name,
                    longitude: loc.coordinates[0],
                    latitude: loc.coordinates[1],
                    icon: loc.iconUrl,
                };
                return acc;
            }, {});

            // Store locations in local storage
            Object.entries(updatedLocations).forEach(([userId, loc]) => {
                localStorage.setItem(`lastlocation${userId}`, JSON.stringify(loc));
            });

            setLocations(updatedLocations);
            if (initialLocations.length > 0) {
                const firstLoc = initialLocations[0];
                setMapCenter({ lat: firstLoc.coordinates[1], lng: firstLoc.coordinates[0] });
                setZoom(14);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLoading(false);
        }
    }, [setMapCenter, setZoom]);

    useEffect(() => {
        fetchInitialLocations();
        const storedLocations = loadStoredLocations();
        setLocations((prevLocations) => ({ ...prevLocations, ...storedLocations }));

        // Set up socket listener to update locations in real-time
        socket.on('location-updated', (newLocation) => {
            setLocations((prevLocations) => {
                const updatedLocations = {
                    ...prevLocations,
                    [newLocation.userId]: {
                        longitude: newLocation.longitude,
                        latitude: newLocation.latitude,
                        name: newLocation.userName,
                        icon: newLocation.iconUrl,
                    },
                };

                // Update local storage
                localStorage.setItem(`lastlocation${newLocation.userId}`, JSON.stringify(updatedLocations[newLocation.userId]));

                // Optionally, update the map center to the new location if desired
                setMapCenter({ lat: newLocation.latitude, lng: newLocation.longitude });
                setZoom(14);

                return updatedLocations;
            });
        });

        return () => {
            socket.off('location-updated');
        };
    }, [fetchInitialLocations, loadStoredLocations]);

    return { locations, loading };
};

const MapComponent = () => {
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [zoom, setZoom] = useState(12);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [activeMarker, setActiveMarker] = useState(null);

    const { locations, loading } = useMapLocations(setMapCenter, setZoom);

    const handleMapLoad = () => {
        setIsMapLoaded(true);
    };

    const getOffsetPosition = (basePosition, index) => ({
        lat: basePosition.lat + index * 0.001,
        lng: basePosition.lng,
    });

    if (loading) {
        return (
            <div className='text-center'>
                <h2 className='text-2xl font-bold'>Loading User Locations...</h2>
                <div className="spinner" style={{ margin: '20px' }}>
                    <img src="spinner.gif" alt="loading" />
                </div>
            </div>
        );
    }    


    function getNearestLocation(latitude, longitude) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(latitude, longitude);
        
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    console.log('Nearest location: ' + results[0].formatted_address);
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }
    

    return (
        <div className='mx-auto lg:w-1/2 text-center'>
            <a href='/' className='fixed top-5 left-3 text-blue-500'><i className='fa fa-angle-left' /> Back</a>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>Dhanya Builders</h2>
            <p className='text-sm font-bold mb-10'>User Tracking System</p>

            <LoadScript googleMapsApiKey='AIzaSyBs0WiuZkmk-m_BSwwa_Hzc0Tu_D4HZ6l8' onLoad={handleMapLoad}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '60vh', borderRadius: '20px' }}
                    zoom={zoom}
                    center={mapCenter}
                >
                    {isMapLoaded &&
                        Object.entries(locations).map(([id, loc], index) => {
                            const adjustedPosition = getOffsetPosition({ lat: loc.latitude, lng: loc.longitude }, index);
                            // getNearestLocation(loc.latitude,loc.longitude)

                            return (
                                <Marker
                                    key={id}
                                    position={adjustedPosition}
                                    icon={{
                                        url: loc.icon || 'https://cdn-icons-png.flaticon.com/512/1673/1673221.png',
                                        scaledSize: new window.google.maps.Size(40, 40),
                                    }}
                                    label={{
                                        text: loc.name || 'Unknown User',
                                        color: 'black',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() => setActiveMarker(id)}
                                >
                                    {activeMarker === id && (
                                        <InfoWindow
                                            position={adjustedPosition}
                                            onCloseClick={() => setActiveMarker(null)}
                                        >
                                            <div className='mx-auto text-center'>
                                                <div className='flex'>
                                                <p className='text-xs font-bold mb-2'>{loc.name || 'Unknown User'}</p>
                                                <img
                                                    className='mx-auto'
                                                    src={'https://cdn-icons-png.flaticon.com/512/1673/1673221.png'}
                                                    alt={loc.name}
                                                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                                    />
                                                    </div>
                                                    <p className='text-xs text-gray-400'>last seen location</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </Marker>
                            );
                        })}
                </GoogleMap>
            </LoadScript>
            <div className='mb-5'></div>
            <hr/>
            <p className='text-lg font-bold mt-4 text-gray-600'>Tracked Users</p>
            {isMapLoaded &&
                        Object.entries(locations).map(([id, loc], index) => { 
                            // getNearestLocation(loc.latitude,loc.longitude)
                            return( 
                                <div key={id}>
                                    <p onClick={()=> setActiveMarker(id)}>{loc.name}</p>
                                </div>
                            )
                        })}
        </div>
    );
};

export default MapComponent;
