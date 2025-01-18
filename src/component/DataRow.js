import React from "react";
import { SettMoreO } from "lovedicons/dist/settO";
import { ArrExportO } from "lovedicons/dist/arrO";

const DataRow = ({ data, onMenuClick, activeIndex, setActiveIndex }) => {
  return (
    <div className="mb-2">
      {data.map((coord, index) => (
        <section key={index} className="grid grid-cols-7 border-b">
          <div className="col-span-1 flex items-center justify-center">
            <input type="checkbox" />
          </div>
          <div className="p-1 col-span-1 flex items-center justify-center">
            {coord.waypoint}
          </div>
          <div className="p-1 col-span-2 flex items-center justify-center">
            {coord.coordinates.join(", ")}
          </div>
          <div className="p-1 col-span-2 flex items-center justify-center">
            {coord.distance}
          </div>
          <div className="relative p-1 col-span-1 flex items-center justify-center">
            <SettMoreO
              className="w-5 h-5 rotate-90"
              onClick={() => setActiveIndex(index)}
            />

            {activeIndex === index && (
              <section className="absolute -right-44 top-0 p-1 flex flex-col gap-1 bg-white rounded-md">
                <div
                  className="p-1 flex hover:bg-purple-300 rounded-md"
                  onClick={() => onMenuClick("insertBefore", index)}
                >
                  <ArrExportO className="w-4 h-4 mr-1 -rotate-90" />
                  <div>Insert Polygon before</div>
                </div>
                <div
                  className="p-1 flex hover:bg-purple-300 rounded-md"
                  onClick={() => onMenuClick("insertBefore", index)}
                >
                  <ArrExportO className="w-4 h-4 mr-1 rotate-90" />
                  <div>Insert Polygon after</div>
                </div>
              </section>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default DataRow;
