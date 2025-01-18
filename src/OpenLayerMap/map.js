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
// import DataRow from "../component/Modal";
import Modal from "../component/Modal";
// import { set } from "ol/transform";

const OpenLayerMap = () => {
  const [map, setMap] = useState(null);
  // eslint-disable-next-line
  const [drawingState, setDrawingState] = useState({
    isDrawing: false,
    activeModal: null,
  });
  const [coordinates, setCoordinates] = useState({
    lineString: [],
    polygon: [],
  });

  const [activeModal, setActiveModal] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

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
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInMeters = R * c;
    const distanceInMiles = distanceInMeters / 1609.34; // Convert to miles
    return distanceInMiles; // Return miles
  }, []);

  const formatCoordinates = useCallback(
    (coordinates) => {
      //   console.log("coordinates --- " + JSON.stringify(coordinates));
      return coordinates.map((coord, index) => ({
        waypoint: `${index.toString().padStart(2, "0")}`,
        coordinates: coord.map((val) => parseFloat(val.toFixed(2))),
        distance:
          index > 0
            ? parseFloat(
                calculateDistance(coord, coordinates[index - 1]).toFixed(2) // Format distance in miles
              )
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

      //   setCoordinates((prev) => ({
      //     ...prev,
      //     // [type === "LineString" ? "lineString" : "polygon"]: formattedCoords,
      //     lineString: formattedCoords,
      //   }));
      setCoordinates((prev) => ({
        ...prev,
        [type === "LineString" ? "lineString" : "polygon"]: formattedCoords,
      }));
      //   setPolygonContent((prev) => ({
      //     ...prev,
      //     polygon: formattedCoords,
      //   }));
      setDrawingState({
        isDrawing: false,
        activeModal: type === "LineString" ? "mission" : "polygon",
      });

      map.removeInteraction(draw);
    });

    map.addInteraction(draw);
    setDrawingState({ isDrawing: true, activeModal: null });
  };

  //   const handleMenuClick = (key, coordIndex) => {
  //     if (key === "insertBefore" || key === "insertAfter") {
  //       startDrawing("Polygon");
  //       setActiveIndex(null);
  //     }
  //   };

  const handleMenuClick = (key, coordIndex) => {
    if (key === "insertBefore" || key === "insertAfter") {
      // Start drawing the polygon
      startDrawing("Polygon");

      // Handle the event after the polygon is drawn
      map.once("drawend", (event) => {
        const polygonCoordinates = event.feature
          .getGeometry()
          .getCoordinates()[0]; // Get the polygon's vertices

        const updatedLineString = [...coordinates.lineString];
        if (key === "insertBefore") {
          updatedLineString.unshift(...polygonCoordinates);
        } else if (key === "insertAfter") {
          updatedLineString.push(...polygonCoordinates);
        }

        // Update the LineString coordinates
        const lineFeature = lineSOurce.current.getFeatures()[0];
        if (lineFeature) {
          lineFeature
            .getGeometry()
            .setCoordinates(
              updatedLineString.map((coord) => coord.coordinates)
            );
        }

        // Update the state
        setCoordinates((prev) => ({
          ...prev,
          lineString: updatedLineString,
        }));

        setActiveIndex(null);
      });
    }
    setActiveIndex(null);
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

  return (
    <main className="relative w-screen h-screen ">
      <main className="absolute z-50 pt-10">
        <div className="font-bold underline">OpenLayers Map</div>
        <section className="m-5 p-3 w-fit bg-violet-500 text-white font-bold rounded-md shadow-2xl shadow-purple-800 cursor-pointer hover:animate-shake">
          <div
            onClick={() => {
              startDrawing("LineString");
            }}
          >
            Draw on the map
          </div>
        </section>

        {activeModal && (
          <Modal
            coordinates={coordinates}
            handleCloseDrawing={handleCloseDrawing}
            handleMenuClick={handleMenuClick}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        )}
      </main>

      <main className="absolute z-50 bottom-10 right-10">
        <div className="mb-2 underline font-medium">Visit my:</div>
        <div className="flex gap-5">
          <a href="https://akbarsha.dev/" target="_blank" rel="noreferrer">
            <div className="button">Portfolio</div>
          </a>
          <a
            href="https://github.com/iamakbarsha1"
            target="_blank"
            rel="noreferrer"
          >
            <div className="button">GitHub</div>
          </a>
        </div>
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
