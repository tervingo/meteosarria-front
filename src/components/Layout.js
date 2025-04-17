// components/Layout.js
import { Box } from '@mui/material';

export const Row = ({ children, width, align, justify, sx, ...rest }) => (
  <Box
    display="flex"
    flexDirection="row"
    width={width}
    alignItems={align}
    justifyContent={justify}
    sx={sx}
    {...rest}
  >
    {children}
  </Box>
);

export const Column = ({ children, width, align, justify, sx, ...rest }) => (
  <Box
    display="flex"
    flexDirection="column"
    width={width}
    alignItems={align}
    justifyContent={justify}
    sx={sx}
    {...rest}
  >
    {children}
  </Box>
);