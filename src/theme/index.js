/**
 * Main theme export - combines all theme modules
 * Provides centralized theme access for the entire application
 * @author Ibraheem Ganayim
 */

import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export const theme = {
  colors,
  typography,
  spacing
};

export { colors, typography, spacing };
export default theme;
