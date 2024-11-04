import { createSlice } from "@reduxjs/toolkit";

export const menuSlice = createSlice({
  name: "menuState",
  initialState: {
    editMenuState: {},
    typesMenuState: {},
    layersMenuState: {},
    viewSettingsMenuState: {},
    playPauseSettingsMenuState: {},
    animationMenuState: {
      toggleAnimationState: false,
      animationSpeedSliderValue: 10,
    },
  },
  reducers: {
    updateLayersMenuState: (state, action) => {
      state.layersMenuState = action.payload;
    },

    updateTypesMenuState: (state, action) => {
      state.typesMenuState = action.payload;
    },

    updateEditMenuState: (state, action) => {
      state.editMenuState = action.payload;
    },

    updateViewSettingsMenuState: (state, action) => {
      state.viewSettingsMenuState = action.payload;
    },

    updatePlayPauseSettingsMenuState: (state, action) => {
      state.playPauseSettingsMenuState = action.payload;
    },

    updateAnimationMenuState: (state, action) => {
      state.animationMenuState = action.payload;
    },
  },
});

export const {
  updateLayersMenuState,
  updateTypesMenuState,
  updateEditMenuState,
  updateViewSettingsMenuState,
  updatePlayPauseSettingsMenuState,
  updateAnimationMenuState,
} = menuSlice.actions;
export default menuSlice.reducer;
