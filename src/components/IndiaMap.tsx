// @ts-nocheck
'use client';

import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { HUBS } from "@/data/hubs";

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

const indiaHubs = HUBS.filter(h => h.region === 'India');

// Animated routes between Indian hubs
const DEMO_ROUTES = [
  ['mumbai', 'delhi'],
  ['delhi', 'kolkata'],
  ['bengaluru', 'chennai'],
  ['mumbai', 'bengaluru'],
  ['hyderabad', 'chennai'],
];

export default function IndiaMap({ sourceHubId, destHubId }: { sourceHubId?: string, destHubId?: string }) {
  const sourceHub = indiaHubs.find(h => h.id === sourceHubId);
  const destHub = indiaHubs.find(h => h.id === destHubId);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000, center: [80, 22] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none", transition: "all 250ms" },
                  hover: { 
                    fill: "rgba(147, 51, 234, 0.3)", 
                    outline: "none", 
                    cursor: "pointer",
                  },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {/* Demo animated routes when no specific route is selected */}
        {!sourceHub && !destHub && DEMO_ROUTES.map(([a, b], i) => {
          const hubA = indiaHubs.find(h => h.id === a);
          const hubB = indiaHubs.find(h => h.id === b);
          if (!hubA || !hubB) return null;
          return (
            <Line
              key={i}
              from={hubA.coordinates}
              to={hubB.coordinates}
              stroke="rgba(99,102,241,0.3)"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="route-animated"
              style={{ strokeDasharray: "6 4" }}
            />
          );
        })}

        {/* Selected route line */}
        {sourceHub && destHub && (
          <Line
            from={sourceHub.coordinates}
            to={destHub.coordinates}
            stroke="#10b981"
            strokeWidth={2.5}
            strokeLinecap="round"
            className="route-animated"
            style={{ strokeDasharray: "6 4" }}
          />
        )}

        {indiaHubs.map(({ id, name, coordinates }) => {
          const isActive = id === sourceHubId || id === destHubId;
          return (
            <Marker key={id} coordinates={coordinates as [number, number]}>
              <circle r={isActive ? 10 : 6} fill={isActive ? "rgba(99,102,241,0.4)" : "rgba(147,51,234,0.2)"} className={isActive ? "animate-ping" : ""} />
              <circle r={isActive ? 5 : 3.5} fill={isActive ? "#6366f1" : "#3b82f6"} />
              <circle r={isActive ? 2 : 1.5} fill="#ffffff" />
              <text
                textAnchor="middle"
                y={-14}
                style={{ fontFamily: "inherit", fill: "#ffffff", fontSize: "10px", fontWeight: "bold", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}
              >
                {name}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
