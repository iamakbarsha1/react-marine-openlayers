// import Map from "ol/Map";
// import View from "ol/View";
// import TileLayer from "ol/layer/Tile";
// import XYZ from "ol/source/XYZ";

// export const renderMap = new Map({
//   target: "map",
//   layers: [
//     new TileLayer({
//       source: new XYZ({
//         url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
//       }),
//     }),
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2,
//   }),
// });

import VectorSource from "ol/source/Vector";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "ol/ol.css";
// import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { Map, View } from "ol";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { Draw } from "ol/interaction";
import { EsseCloseCircleO } from "lovedicons/dist/esseO";
import { ArrExportO } from "lovedicons/dist/arrO";
import DataRow from "../component/Modal";
// import { set } from "ol/transform";

const OpenLayerMap = () => {
  const [map, setMap] = useState(null);
  const [drawingState, setDrawingState] = useState({
    isDrawing: false,
    activeModal: null,
  });
  const [coordinates, setCoordinates] = useState({
    lineString: [],
    polygon: [],
  });

  const [activeModal, setActiveModal] = useState(null);
  //   const [activeIndex, setActiveIndex] = useState(null);

  const lineSOurce = useRef(new VectorSource());
  const polygonSoucre = useRef(new VectorSource());

  const handleCloseDrawing = () => {
    setDrawingState({
      isDrawing: false,
      activeModal: null,
    });
    setActiveModal(false);
  };

  const calculateDistance = useCallback(([lon1, lat1], [lon2, lat2]) => {
    const R = 6371000; // Radius of the Earth in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const formatCoordinates = useCallback(
    (coordinates) => {
      return coordinates.map((coord, index) => ({
        waypoint: `WP(${index.toString().padStart(2, "0")})`,
        coordinates: coord.map((val) => parseFloat(val.toFixed(2))),
        distance:
          index > 0
            ? calculateDistance(coord, coordinates[index - 1]).toFixed(2)
            : 0,
      }));
    },
    [calculateDistance]
  );

  const startDrawing = (type) => {
    if (!map) return;
    setActiveModal(true);

    const source =
      type === "LineString" ? lineSOurce.current : polygonSoucre.current;
    const draw = new Draw({ source, type });

    draw.on("drawend", (event) => {
      const rawCoordinates = event.feature.getGeometry().getCoordinates();
      const formattedCoords = formatCoordinates(
        type === "LineString" ? rawCoordinates : rawCoordinates[0]
      );

      setCoordinates((prev) => ({
        ...prev,
        [type === "LineString" ? "lineString" : "polygon"]: formattedCoords,
      }));
      setDrawingState({
        isDrawing: false,
        activeModal: type === "LineString" ? "mission" : "polygon",
      });

      map.removeInteraction(draw);
    });

    map.addInteraction(draw);
    setDrawingState({ isDrawing: true, activeModal: null });
  };

  const handleMenuClick = (key, coordIndex) => {
    if (key === "insertBefore" || key === "insertAfter") {
      startDrawing("Polygon");
    }
  };

  //   initialize map
  useEffect(() => {
    const intializeMap = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          //   source: lineSOurce.current(),
          source: lineSOurce.current,
        }),
        new VectorLayer({
          source: polygonSoucre.current,
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        // center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(intializeMap);

    // return () => intializeMap.setTarget(undefined || null);
    return () => intializeMap.setTarget(undefined);
  }, []);

  console.log(
    "coordinates?.lineString" + JSON.stringify(coordinates?.lineString)
  );
  console.log("coordinates?.polygon" + JSON.stringify(coordinates?.polygon));

  return (
    <main className="relative w-screen h-screen ">
      <main className="absolute z-50 pt-10">
        <div>OpenLayerMap</div>
        <section className="m-5 p-3 bg-violet-500 text-white font-bold rounded-md cursor-pointer">
          <div
            onClick={() => {
              startDrawing("LineString");
            }}
          >
            Draw on the map
          </div>
        </section>

        {activeModal && (
          <main>
            <main className="ml-5 bg-white rounded-md text-xs">
              <section className="p-3 flex items-center justify-between shadow-md">
                <div className="font-bold">Mission Creation</div>
                <EsseCloseCircleO
                  className="w-5 h-5"
                  onClick={handleCloseDrawing}
                />
              </section>
              <section className="py-3 px-3 flex flex-col items-start border-b border-gray-400">
                <div className="mb-2 font-bold">Waypoint Navigation</div>
                <div>
                  {coordinates?.lineString.length > 0 ||
                  coordinates?.polygon.length > 0 ? (
                    <div className="grid grid-cols-7 font-bold border-b border-t">
                      <div className="p-1 col-span-1 flex items-center justify-center">
                        <input type="checkbox" />
                      </div>
                      <div className="p-1 col-span-1 flex items-center justify-center">
                        WP
                      </div>
                      <div className="p-1 col-span-2 flex items-center justify-center">
                        Coordinates
                      </div>
                      <div className="p-1 col-span-2 flex items-center justify-center">
                        Distance(m)
                      </div>
                      <div className="p-1 col-span-1 flex items-center justify-center">
                        <ArrExportO className="w-5 h-5" />
                      </div>
                    </div>
                  ) : null}

                  {coordinates?.lineString.length > 0 ? (
                    <DataRow
                      data={coordinates?.lineString}
                      onMenuClick={handleMenuClick}
                    />
                  ) : null}
                  {coordinates?.polygon.length > 0 ? (
                    <DataRow
                      data={coordinates?.polygon}
                      onMenuClick={handleMenuClick}
                    />
                  ) : null}
                </div>

                <div className="p-3 bg-gray-200 border border-black border-dashed rounded-md">
                  Click on the map to mark the points of the route and press
                  enter/right click, complete the route
                </div>
              </section>
              <section className="p-2 flex justify-end">
                <div className="p-2 w-fit bg-violet-500 text-white font-bold rounded-md cursor-pointer">
                  Generate Data
                </div>
              </section>
            </main>
          </main>
        )}
      </main>

      <section
        id="map"
        className="z-10 w-full h-full"
        // style={{
        //   width: "100vw",
        //   height: "90vh",
        //   backgroundColor: "#ffe",
        //   //   zIndex: "5",
        // }}
      ></section>
    </main>
  );
};

export default OpenLayerMap;
