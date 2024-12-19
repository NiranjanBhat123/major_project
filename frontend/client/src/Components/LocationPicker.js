import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Box } from '@mui/material';

const LocationPicker = ({ onConfirm, initialPosition = [12.2799972, 76.6520893] }) => {
    const [centerPosition] = useState(initialPosition);
    const [mapCenter, setMapCenter] = useState(centerPosition);
    const mapRef = useRef(null);

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(mapCenter[0], mapCenter[1]);
        }
    };

    // Component to update map center on map events
    const UpdateMapCenter = () => {
        useMapEvents({
            moveend: () => {
                const map = mapRef.current;
                if (map) {
                    const center = map.getCenter();
                    setMapCenter([center.lat, center.lng]);
                }
            },
        });
        return null;
    };

    return (
        <Box sx={{
            height: "100%",
            width: "100%",
            position: "relative",
            bgcolor: "grey.100"
        }}>
            {/* Map Container */}
            <MapContainer
                center={centerPosition}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "calc(100% - 80px)", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <UpdateMapCenter />
            </MapContainer>

            {/* Fixed Marker Icon */}
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -100%)",
                zIndex: 1000,
                pointerEvents: "none",
                
            }}>
                <img
                    src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
                    alt="marker"
                    style={{ width: "30px", height: "41px" }}
                />
            </Box>

            {/* Confirm Button */}
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",   
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                bottom: 0,
                width: '100%',
                zIndex: 1000
            }}>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem'
                    }}
                >
                    Confirm Location
                </Button>
            </Box>
        </Box>
    );
};

export default LocationPicker;