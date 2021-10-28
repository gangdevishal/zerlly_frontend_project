import {
    APPLY_THEME 
} from "./types";
import { setAlert } from './alert';
import {setTheme} from '../../utils/helpers'
// Apply Theme
export const applyTheme  = (theme) => async (dispatch) => {
  try {
    dispatch({ type: APPLY_THEME, payload: theme });
    setTheme(theme);
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};