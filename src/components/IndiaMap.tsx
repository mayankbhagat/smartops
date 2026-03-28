// @ts-nocheck
'use client';

import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { HUBS } from "@/data/hubs";

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

export default function IndiaMap({ sourceHubId, destHubId }: { sourceHubId?: string, destHubId?: string }) {
  const sourceHub = HUBS.find(h => h.id === sourceHubId);
  const destHub = HUBS.find(h => h.id === destHubId);

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
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={0.8}
                style={{
                  default: { 
                    outline: "none", 
                    transition: "all 250ms", 
                    filter: "drop-shadow(0px 0px 6px rgba(255, 255, 255, 0.4))" 
                  },
                  hover: { 
                    fill: "rgba(147, 51, 234, 0.4)", 
                    outline: "none", 
                    cursor: "pointer", 
                    filter: "drop-shadow(0px 0px 15px rgba(147, 51, 234, 0.8))" 
                  },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {/* Draw Line connecting points if both are selected */}
        {sourceHub && destHub && (
          <Line
            from={sourceHub.coordinates}
            to={destHub.coordinates}
            stroke="#10b981"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              strokeDasharray: "4",
              animation: "dash 1s linear infinite",
            }}
          />
        )}

        {HUBS.map(({ name, coordinates }) => (
          <Marker key={name} coordinates={coordinates as [number, number]}>
            <circle r={8} fill="#9333ea" className="animate-ping opacity-75" />
            <circle r={4} fill="#3b82f6" />
            <circle r={2} fill="#ffffff" />
            <text
              textAnchor="middle"
              y={-15}
              style={{ fontFamily: "inherit", fill: "#ffffff", fontSize: "12px", fontWeight: "bold", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}
            >
              {name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
