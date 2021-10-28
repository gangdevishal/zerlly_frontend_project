import { APPLY_THEME } from "../actions/types";
import { lightTheme } from "../../components/themes/Themes";
import { getTheme } from "../../utils/helpers";

const initialState = {
    latest_theme: getTheme() ? getTheme() : lightTheme
};

const themeReducer = (state=initialState, action) => {
    const { type, payload } = action;
    switch (type) {
      case APPLY_THEME:
        return {...state, latest_theme:payload}
      default:
        return state;
    }
};


export default themeReducer;
