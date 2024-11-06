/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { cityIOSettings } from "../../settings/settings";
import {
  updateCityIOdata,
  toggleCityIOisDone,
} from "../../redux/reducers/cityIOdataSlice";
import { useSelector, useDispatch } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket"
import LoadingProgressBar from "../LoadingProgressBar";

const CityIO = (props) => {

  const verbose = true; // set to true to see console logs
  const dispatch = useDispatch();
  const cityIOdata = useSelector((state) => state.cityIOdataState.cityIOdata);
  const { tableName } = props;
  const possibleModules = cityIOSettings.cityIO.cityIOmodules.map(module => module.name)
  const [arrLoadingModules, setArrLoadingModules] = useState([]);

  // Creation of the websocket connection. TODO: change WS_URL to env or property
  //    sendJsonMessage: function that sends a message through the websocket channel
  //    lastJsonMessage: object that contains the last message received through the websocket
  //    readyState: indicates whether the WS is ready or not
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    cityIOSettings.cityIO.websocketURL,
    {
      share: true,
      shouldReconnect: () => true,
    },
  )

  // When the WS connection state (readyState) changes to OPEN, 
  // the UI sends a LISTEN (SUBSCRIBE) message to CityIO with the tableName prop
  useEffect(() => {
    console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: "LISTEN",
        content: {
          gridId: tableName,
        },
      })
      setArrLoadingModules([
        `Loading ${tableName} data.`,
      ]);
    }
  }, [readyState])


  // When a new WebSocket message is received (lastJsonMessage) the UI checks
  //  the type of the message and performs the suitable operation
  useEffect(() => {

    if(lastJsonMessage == null) return;
    console.log(`Got a new message: ${JSON.stringify(lastJsonMessage)}`)
    
    let messageType = lastJsonMessage.type;

    // If the message is of type GRID, the UI updates the GEOGRID and
    // GEOGRIDDATA, optionally, CityIO can send saved modules
    if (messageType === 'TABLE_SNAPSHOT'){
      verbose && console.log(
        ` --- trying to update GEOGRID --- ${JSON.stringify(lastJsonMessage.content)}`
      );
      setArrLoadingModules([]);

      let m = {...cityIOdata, "GEOGRID": lastJsonMessage.content.GEOGRID, "GEOGRIDDATA":lastJsonMessage.content.GEOGRIDDATA, tableName: tableName };

      Object.keys(lastJsonMessage.content).forEach((key)=>{
        if(possibleModules.includes(key) && key !== 'scenarios' && key !== 'indicators'){
          m[key] = lastJsonMessage.content[key]
        } 
        else if(key === 'LAYERS'){
          m = {...m, "layers": lastJsonMessage.content[key] };
        }
        else if(key === 'NUMERICINDICATORS'){
          m = {...m, "indicators": lastJsonMessage.content[key] };
        }
      }
      );
      // When we receive a GRID message, we ask for the scenarios of the table we´re
      //  connected, and for the core modules
      sendJsonMessage({
        type: "REQUEST_CORE_MODULES_LIST",
        content: {},
      })
      sendJsonMessage({
        type: "LIST_SCENARIOS",
        content: {},
      })
      dispatch(updateCityIOdata(m));
      verbose &&
        console.log(
          "%c --- done updating from cityIO ---",
          "color: rgb(0, 255, 0)"
        );
      dispatch(toggleCityIOisDone(true));  
    }
    // If we receive a GEOGRIDDATA_UPDATE, the UI needs to refresh
    //  the GEOGRIDDATA object
    else if (messageType === 'GEOGRIDDATA_UPDATE'){
      verbose && console.log(
        ` --- trying to update GEOGRIDDATA --- ${JSON.stringify(lastJsonMessage.content)}`
      );
      let m = {...cityIOdata, "GEOGRIDDATA":lastJsonMessage.content };
      dispatch(updateCityIOdata(m));
      verbose &&
        console.log(
          "%c --- done updating from cityIO ---",
          "color: rgb(0, 255, 0)"
        );
      dispatch(toggleCityIOisDone(true));  
    }

    // If we receive a INDICATOR (MODULE) message, the UI needs to load
    //  the module data
    // WIP
    else if (messageType === 'MODULE'){
      verbose && console.log(
        ` --- trying to update MODULE data --- ${JSON.stringify(lastJsonMessage.content)}`
      );
      let m = {...cityIOdata}
      if('numeric' in lastJsonMessage.content.moduleData){
        var newIndicatorsNames = [];
        var newIndicators = [];

        lastJsonMessage.content.moduleData.numeric
          .forEach((indicator) => {
            newIndicators.push(indicator);
            newIndicatorsNames.push(indicator.name)
          });
        const currentIndicators = m['indicators']
        if(currentIndicators){
          currentIndicators.forEach((oldIndicator)=>{
            if(!newIndicatorsNames.includes(oldIndicator.name)){
              newIndicators.push(oldIndicator)
            }
          })  
        }

        m = {...m, "indicators": newIndicators};
      }
      if('layers' in lastJsonMessage.content.moduleData){ // "id":"geojson","type":"geojsonbase"
        
        var newLayersIds = [];
        var newLayers = [];

        lastJsonMessage.content.moduleData.layers
          .forEach((layer) => {
            newLayers.push(layer);
            newLayersIds.push(layer.id)
          });
        const currentLayers = m['layers']
        if(currentLayers){
          currentLayers.forEach((oldLayer)=>{
            if(!newLayersIds.includes(oldLayer.id)){
              newLayers.push(oldLayer)
            }
          })  
        }

        m = {...m, "layers":newLayers };
        }

      dispatch(updateCityIOdata(m));
      verbose &&
        console.log(
          "%c --- done updating from cityIO ---",
          "color: rgb(0, 255, 0)"
        );
      dispatch(toggleCityIOisDone(true));  
    }

    // If we receive a CORE_MODULES_LIST message, the UI loads
    //  the available modules data
    else if (messageType === 'CORE_MODULES_LIST'){
      verbose && console.log(
        ` --- trying to update CORE_MODULES_LIST --- ${JSON.stringify(lastJsonMessage.content)}`
      );
      let m = {...cityIOdata, 'core_modules':lastJsonMessage.content }
      dispatch(updateCityIOdata(m));
      verbose &&
        console.log(
          "%c --- done updating from cityIO ---",
          "color: rgb(0, 255, 0)"
        );
      dispatch(toggleCityIOisDone(true));  
    }

    // If we receive a SCENARIOS message, the UI loads
    //  the available scenarios
    else if (messageType === 'SCENARIOS'){
      verbose && console.log(
        ` --- trying to update SCENARIOS --- ${JSON.stringify(lastJsonMessage.content)}`
      );
      let m = {...cityIOdata, 'scenarios':lastJsonMessage.content }
      dispatch(updateCityIOdata(m));
      verbose &&
        console.log(
          "%c --- done updating from cityIO ---",
          "color: rgb(0, 255, 0)"
        );
      dispatch(toggleCityIOisDone(true));  
    }

  }, [lastJsonMessage])

  return <LoadingProgressBar loadingModules={arrLoadingModules} />;

};

export default CityIO;
