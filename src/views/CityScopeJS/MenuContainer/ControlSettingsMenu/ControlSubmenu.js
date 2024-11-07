import { useLayoutEffect, useState } from "react";
import { ButtonGroup, Button, List } from "@mui/material";
import { controlButtons, cityIOSettings } from "../../../../settings/settings";
import { updateControlSettingsMenuState } from "../../../../redux/reducers/menuSlice";
import { useDispatch } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket"

function ControlSubmenu() {
  const dispatch = useDispatch();

  const [controlSettingsMenuState, setControlSettingsMenuState] = useState();

  const { sendJsonMessage, readyState } = useWebSocket(
    cityIOSettings.cityIO.websocketURL,
    {
      share: true,
      shouldReconnect: () => true,
    },
  )

  // return the menu state to parent component
  useLayoutEffect(() => {
    //  dispatch this menu state to the redux store
    dispatch(updateControlSettingsMenuState(controlSettingsMenuState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlSettingsMenuState]);

  const handleButtonClicks = (thisButton) => {
    let dataProps = [];
    dataProps[0] = controlButtons[thisButton].displayName;
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: "UPDATE_GRID",
        content: {
          geogriddata: dataProps,
        },
      })
    }
    setControlSettingsMenuState({
      ...controlSettingsMenuState,
      PLAY_PAUSE_BUTTONS: thisButton,
    });
  };

  // create a button group for the view control buttons
  const createControlButtons = (controlButtons) => {
    const buttonsArr = [];
    for (const thisButton in controlButtons) {
      buttonsArr.push(
        <Button
          key={Math.random()}
          size="small"
          onClick={() => handleButtonClicks(thisButton)}
        >
          {controlButtons[thisButton].displayName}
        </Button>
      );
    }
    return (
      <ButtonGroup fullWidth sx={{ width: "100%" }} color="primary">
        {buttonsArr}
      </ButtonGroup>
    );
  };

  return <List>{createControlButtons(controlButtons)}</List>;
}

export default ControlSubmenu;
