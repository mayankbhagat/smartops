// @ts-nocheck
'use client';

import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { HUBS } from "@/data/hubs";

const worldGeoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GlobalMap({ sourceHubId, destHubId }: { sourceHubId?: string; destHubId?: string }) {
  const sourceHub = HUBS.find(h => h.id === sourceHubId);
  const destHub = HUBS.find(h => h.id === destHubId);

  // Filter to only show hubs from relevant regions when two hubs are selected
  const displayHubs = HUBS;

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [50, 20] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={worldGeoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(99, 102, 241, 0.08)"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={0.3}
                style={{
                  default: { outline: "none" },
                  hover: {
                    fill: "rgba(99, 102, 241, 0.18)",
                    outline: "none",
                    cursor: "pointer",
                  },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Route line */}
        {sourceHub && destHub && (
          <g>
            <Line
              from={sourceHub.coordinates}
              to={destHub.coordinates}
              stroke="url(#routeGradient)"
              strokeWidth={8}
              strokeLinecap="round"
              className="route-animated"
              style={{ strokeDasharray: "12 8", filter: 'drop-shadow(0px 0px 8px rgba(99,102,241,0.8))', opacity: 0.3 }}
            />
            <Line
              from={sourceHub.coordinates}
              to={destHub.coordinates}
              stroke="url(#routeGradient)"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="route-animated"
              style={{ strokeDasharray: "8 4", filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.6))' }}
            />
          </g>
        )}

        {/* Hub markers */}
        {displayHubs.map(({ id, name, coordinates, region }) => {
          const isActive = id === sourceHubId || id === destHubId;
          return (
            <Marker key={id} coordinates={coordinates as [number, number]}>
              {isActive && <circle r={10} fill="rgba(99,102,241,0.3)" className="animate-ping" />}
              <circle r={isActive ? 5 : 3} fill={isActive ? "#6366f1" : "rgba(99,102,241,0.5)"} />
              <circle r={isActive ? 2 : 1.2} fill="#ffffff" />
              {isActive && (
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{
                    fontFamily: "inherit",
                    fill: "#ffffff",
                    fontSize: "9px",
                    fontWeight: "bold",
                    filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.9))",
                  }}
                >
                  {name}
                </text>
              )}
            </Marker>
          );
        })}
      </ComposableMap>

      {/* SVG gradient def for route line */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
