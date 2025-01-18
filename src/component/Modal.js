import React from "react";
import { EsseCloseCircleO } from "lovedicons/dist/esseO";
import { ArrExportO } from "lovedicons/dist/arrO";
import DataRow from "./DataRow";

const Modal = ({
  coordinates,
  handleCloseDrawing,
  handleMenuClick,
  activeIndex,
  setActiveIndex,
}) => {
  return (
    <main className="ml-5 bg-white rounded-md text-xs">
      <section className="p-3 flex items-center justify-between shadow-md">
        <div className="font-bold">Mission Creation</div>
        <EsseCloseCircleO
          className="w-5 h-5 cursor-pointer"
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
            <>
              <div className="p-1 flex items-start underline">LineString</div>
              <DataRow
                data={coordinates?.lineString}
                onMenuClick={handleMenuClick}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </>
          ) : null}
          {coordinates?.polygon.length > 0 ? (
            <>
              <div className="p-1 flex items-start underline">Polygon</div>
              <DataRow
                data={coordinates?.polygon}
                onMenuClick={handleMenuClick}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </>
          ) : null}
        </div>

        <div className="p-3 bg-gray-200 border border-black border-dashed rounded-md">
          Click on the map to mark the points of the route and press enter/right
          click, complete the route
        </div>
      </section>
      <section className="p-2 flex justify-end">
        <div
          className="p-2 w-fit bg-violet-500 text-white font-bold rounded-md cursor-pointer hover:animate-shake"
          onClick={handleCloseDrawing}
        >
          Generate Data
        </div>
      </section>
    </main>
  );
};

export default Modal;
