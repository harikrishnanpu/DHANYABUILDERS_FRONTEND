import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import io from 'socket.io-client';
import moment from 'moment'; // Import moment.js for date formatting

const socket = io('https://dhanyabuilders-backend.onrender.com/'); // Replace with your server URL

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
            const response = await axios.get('/api/users/location/users');
            const initialLocations = response.data;

            const updatedLocations = initialLocations.reduce((acc, loc) => {
                acc[loc.userId] = {
                    name: loc.name,
                    longitude: loc.coordinates[0],
                    latitude: loc.coordinates[1],
                    icon: loc.iconUrl,
                    path: [[loc.coordinates[1], loc.coordinates[0]]], // Initialize path with the first position
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

    const updateLocationAddress = (userId, address) => {
        setLocations((prevLocations) => ({
            ...prevLocations,
            [userId]: {
                ...prevLocations[userId],
                address,
            },
        }));
    };

    useEffect(() => {
        fetchInitialLocations();
        const storedLocations = loadStoredLocations();
        setLocations((prevLocations) => ({ ...prevLocations, ...storedLocations }));

        socket.on('location-updated', (newLocation) => {
            setLocations((prevLocations) => {
                const updatedLocations = {
                    ...prevLocations,
                    [newLocation.userId]: {
                        ...prevLocations[newLocation.userId],
                        longitude: newLocation.longitude,
                        latitude: newLocation.latitude,
                        name: newLocation.userName,
                        icon: newLocation.iconUrl,
                        path: [...prevLocations[newLocation.userId].path, [newLocation.latitude, newLocation.longitude]], // Update path
                    },
                };

                localStorage.setItem(`lastlocation${newLocation.userId}`, JSON.stringify(updatedLocations[newLocation.userId]));
                setMapCenter({ lat: newLocation.latitude, lng: newLocation.longitude });
                setZoom(14);

                return updatedLocations;
            });
        });

        return () => {
            socket.off('location-updated');
        };
    }, [fetchInitialLocations, loadStoredLocations]);

    return { locations, loading, updateLocationAddress };
};

const MapComponent = () => {
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [zoom, setZoom] = useState(12);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [activeMarker, setActiveMarker] = useState(null);

    const { locations, loading, updateLocationAddress } = useMapLocations(setMapCenter, setZoom);

    const handleMapLoad = () => {
        setIsMapLoaded(true);
    };

    const getNearestLocation = async (latitude, longitude, userId) => {
        return new Promise((resolve, reject) => {
            var geocoder = new window.google.maps.Geocoder();
            var latlng = new window.google.maps.LatLng(latitude, longitude);
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                    updateLocationAddress(userId, results[0].formatted_address); // Update address
                } else {
                    reject('Geocoder failed');
                }
            });
        });
    };

    useEffect(() => {
        Object.entries(locations).forEach(([id, loc]) => {
            if (!loc.address) {
                getNearestLocation(loc.latitude, loc.longitude, id)
                    .then((address) => {
                        updateLocationAddress(id, address); // Update address
                    })
                    .catch((err) => console.error(err));
            }
        });
    }, [locations, updateLocationAddress]);

    const handleUserClick = (id) => {
        const location = locations[id];
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        setActiveMarker(id);
    };

    if (loading) {
        return (
            <div className='text-center flex items-center justify-center h-screen overflow-hidden'>
                <div>
                    <div className="spinner text-3xl">
                        <i className='fa fa-cog animate-spin' />
                    </div>
                    <h2 className='text-sm mt-5 text-gray-400 font-bold'>Loading user tracking system</h2>
                    <p className='text-xs font-bold mt-2 text-gray-300'>Dhanya Builders</p>
                </div>
            </div>
        );
    }

    return (
        <div className='mx-auto lg:w-1/2 text-center'>
            <a href='/' className='fixed top-5 left-3 text-blue-500'><i className='fa fa-angle-left' /> Back</a>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>Dhanya Builders</h2>
            <p className='text-sm font-bold mb-10'>User Tracking System</p>
            <div>
                <LoadScript googleMapsApiKey='AIzaSyBs0WiuZkmk-m_BSwwa_Hzc0Tu_D4HZ6l8' onLoad={handleMapLoad}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '60vh', borderRadius: '20px' }}
                        zoom={zoom}
                        center={mapCenter}
                    >
                        {isMapLoaded && Object.entries(locations).map(([id, loc]) => (
                            <React.Fragment key={id}>
                                {/* Draw the path */}
                                <Polyline
                                    path={loc.path.map(pos => ({ lat: pos[0], lng: pos[1] }))}
                                    options={{
                                        strokeColor: "#FF0000",
                                        strokeOpacity: 0.7,
                                        strokeWeight: 2,
                                    }}
                                />

                                {/* Place the final marker */}
                                <Marker
                                    position={{ lat: loc.latitude, lng: loc.longitude }}
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
                                            position={{ lat: loc.latitude, lng: loc.longitude }}
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
                                                <p className='text-xs text-gray-400'>Last seen location</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </Marker>
                            </React.Fragment>
                        ))}
                    </GoogleMap>
                </LoadScript>
            </div>

            <div className='mb-5'></div>
            <hr />
            <p className='text-lg font-bold mt-4 text-gray-600'>Tracked Users</p>

            {/* Tracked Users Section */}
            <div className="space-y-4 mt-5">
                {Object.entries(locations).map(([id, loc]) => (
                    <div
                        key={id}
                        onClick={() => handleUserClick(id)}
                        className="bg-white shadow rounded-lg p-4 flex items-center hover:bg-gray-100 cursor-pointer transition"
                    >
                        <img
                            className="w-12 h-12 rounded-full mr-4"
                            src={loc.icon || 'https://cdn-icons-png.flaticon.com/512/1673/1673221.png'}
                            alt={loc.name}
                        />
                        <div className="flex-grow">
                            <p className="text-lg font-bold text-gray-800">{loc.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">
                                {loc.address || 'Fetching nearest location...'}
                            </p>
                        </div>
                        <div className="text-sm text-gray-400">
                            <i className="fa fa-clock-o mr-1" />
                            {moment(loc.lastUpdated).fromNow() || 'Unknown time'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapComponent;
