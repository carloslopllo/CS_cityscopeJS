import { useLayoutEffect, useState } from "react";
import { ButtonGroup, Button, List } from "@mui/material";
import { playPauseControlButtons } from "../../../../settings/settings";
import { updatePlayPauseSettingsMenuState } from "../../../../redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

function PlayPauseSubmenu() {
  const dispatch = useDispatch();

  const [playPauseSettingsMenuState, setPlayPauseSettingsMenuState] = useState();

  // return the menu state to parent component
  useLayoutEffect(() => {
    //  dispatch this menu state to the redux store
    dispatch(updatePlayPauseSettingsMenuState(playPauseSettingsMenuState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playPauseSettingsMenuState]);

  const handleButtonClicks = (thisButton) => {
    setPlayPauseSettingsMenuState({
      ...playPauseSettingsMenuState,
      PLAY_PAUSE_BUTTONS: thisButton,
    });
  };

  // create a button group for the view control buttons
  const createPlayPauseControlButtons = (playPauseControlButtons) => {
    const buttonsArr = [];
    for (const thisButton in playPauseControlButtons) {
      buttonsArr.push(
        <Button
          key={Math.random()}
          size="small"
          onClick={() => handleButtonClicks(thisButton)}
        >
          {playPauseControlButtons[thisButton].displayName}
        </Button>
      );
    }
    return (
      <ButtonGroup fullWidth sx={{ width: "100%" }} color="primary">
        {buttonsArr}
      </ButtonGroup>
    );
  };

  return <List>{createPlayPauseControlButtons(playPauseControlButtons)}</List>;
}

export default PlayPauseSubmenu;
