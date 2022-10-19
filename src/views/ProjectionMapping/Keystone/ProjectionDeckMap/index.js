import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { mapSettings as settings } from "../../../../settings/settings";
import {
  SimpleMeshLayer,
  TripsLayer,
  HeatmapLayer,
  TextLayer,
  BitmapLayer,
} from "deck.gl";
import { OBJLoader } from "@loaders.gl/obj";
import { CubeGeometry } from "@luma.gl/engine";
import { processGridData } from "../../../CityScopeJS/DeckglMap/deckglLayers/GridLayer";
import { hexToRgb } from "../../../../utils/utils";
import DeckMap from "./DeckMap";
import { TileLayer } from "@deck.gl/geo-layers";

export default function ProjectionDeckMap(props) {
  const cube = new CubeGeometry({ type: "x,z", xlen: 0, ylen: 0, zlen: 0 });

  const editMode = props.editMode;
  const viewStateEditMode = props.viewStateEditMode;
  const layersVisibilityControl = props.layersVisibilityControl;
  const cityIOdata = useSelector((state) => state.cityIOdataState.cityIOdata);
  const TUIobject = cityIOdata?.tui;

  const GEOGRID = processGridData(cityIOdata);
  const header = GEOGRID.properties.header;

  const [time, setTime] = useState(settings.map.layers.ABM.startTime);
  const [animation] = useState({});

  const styles = {
    Dark: "cjs9rb33k2pix1fo833uweyjd",
    Light: "ck0h5xn701bpr1dqs3he2lecq",
    Normal: "cl8dv36nv000t14qik9yg4ys6",
  };
  const activeMapStyle =
    TUIobject?.MAP_STYLE?.toggle_array?.names[
      TUIobject?.MAP_STYLE?.toggle_array?.curr_active
    ];
  const mapStyle = activeMapStyle && styles[activeMapStyle];

  const animate = () => {
    setTime((t) => {
      return t > settings.map.layers.ABM.endTime
        ? settings.map.layers.ABM.startTime
        : t + settings.map.layers.ABM.animationSpeed;
    });
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation]);

  const layersArray = () => {
    if (!TUIobject) {
      return [
        new TextLayer({
          id: "text",

          data: [{ text: "Missing TUI object in cityIO" }],
          getPosition: (d) => [
            cityIOdata.GEOGRID.properties.header.longitude,
            cityIOdata.GEOGRID.properties.header.latitude,
          ],
          getText: (d) => d.text,
          getColor: (d) => [255, 0, 0],
          getSize: 100,
        }),
      ];
    } else {
      return [
        new TileLayer({
          data:
            mapStyle &&
            `https://api.mapbox.com/styles/v1/relnox/${mapStyle}/tiles/256/{z}/{x}/{y}?access_token=` +
              process.env.REACT_APP_MAPBOX_TOKEN +
              "&attribution=false&logo=false&fresh=true",
          minZoom: 0,
          maxZoom: 21,
          tileSize: 256,
          visible: true,
          id: "OSM",
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;

            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
            });
          },
        }),

        new SimpleMeshLayer({
          id: "mesh-layer",
          data: GEOGRID.features,
          loaders: [OBJLoader],
          mesh: cube,

          getPosition: (d) => {
            const pntArr = d.geometry.coordinates[0];
            const first = pntArr[1];
            const last = pntArr[pntArr.length - 2];
            const center = [
              (first[0] + last[0]) / 2,
              (first[1] + last[1]) / 2,
              1,
            ];
            return center;
          },
          getColor: (d) => d.properties.color,
          opacity: 1,
          getOrientation: (d) => [-180, header.rotation, -90],
          getScale: (d) => [
            GEOGRID.properties.header.cellSize / 2.1,
            1,
            GEOGRID.properties.header.cellSize / 2.1,
          ],

          updateTriggers: {
            getScale: GEOGRID,
          },
        }),

        new HeatmapLayer({
          id: "ACCESS",

          visible: TUIobject?.ACCESS?.active,
          colorRange: [
            [233, 62, 58],
            [237, 104, 60],
            [243, 144, 63],
          ],
          intensity: 1,
          threshold: 0.5,
          data: cityIOdata?.access?.features,
          getPosition: (d) => d.geometry.coordinates,
          getWeight: (d) =>
            d.properties[TUIobject?.ACCESS?.toggle_array?.curr_active],
          updateTriggers: {
            getWeight: TUIobject?.ACCESS?.toggle_array?.curr_active,
          },
          parameters: {
            depthTest: false,
          },
        }),

        new TripsLayer({
          id: "ABM",
          parameters: {
            depthTest: false,
          },
          visible: TUIobject?.ABM?.active,
          data: cityIOdata?.ABM2?.trips,
          getColor: (d) => {
            let col = hexToRgb(cityIOdata.ABM2.attr.mode[d.mode].color);
            return col;
          },
          getPath: (d) => d.path,
          getTimestamps: (d) => d.timestamps,
          fadeTrail: true,
          getWidth: 10,
          trailLength: 200,
          currentTime: time,
        }),

        // text layer in the center of each grid cell from the cityIOdata.GEOGRID.features
        new TextLayer({
          parameters: {
            depthTest: false,
          },
          id: "text",
          visible: TUIobject?.TEXT?.active,
          data: cityIOdata?.GEOGRID?.features,
          getPosition: (d) => {
            const pntArr = d.geometry.coordinates[0];
            const first = pntArr[1];
            const last = pntArr[pntArr.length - 2];
            const center = [(first[0] + last[0]) / 2, (first[1] + last[1]) / 2];
            return center;
          },
          getText: (d) => {
            var length = 6;
            return d.properties.name.length > length
              ? d.properties.name.substring(0, length - 3) + ".."
              : d.properties.name;
          },
          getColor: (d) => [0, 0, 0],
          getSize: 8,
        }),
      ];
    }
  };

  return (
    <DeckMap
      editMode={editMode}
      viewStateEditMode={viewStateEditMode}
      layers={layersArray(layersVisibilityControl)}
    />
  );
}
