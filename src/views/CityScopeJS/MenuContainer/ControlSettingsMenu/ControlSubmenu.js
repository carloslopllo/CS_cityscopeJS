import { useLayoutEffect, useState } from "react";
import { ButtonGroup, Button, List } from "@mui/material";
import { controlButtons } from "../../../../settings/settings";
import { updateControlSettingsMenuState } from "../../../../redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

function ControlSubmenu() {
  const dispatch = useDispatch();

  const [controlSettingsMenuState, setControlSettingsMenuState] = useState();

  // return the menu state to parent component
  useLayoutEffect(() => {
    //  dispatch this menu state to the redux store
    dispatch(updateControlSettingsMenuState(controlSettingsMenuState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlSettingsMenuState]);

  const handleButtonClicks = (thisButton) => {
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
