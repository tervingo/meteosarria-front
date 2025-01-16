const GetWindDir = (dir) => {
    let windir;
    if (dir >= 348.75 || dir < 11.25) {
      windir = 'N';
    } else if (dir >= 11.25 && dir < 33.75) {
      windir = 'NNE';
    } else if (dir >= 33.75 && dir < 56.25) {
      windir = 'NE';
    } else if (dir >= 56.25 && dir < 78.75) {
      windir = 'NEE';
    } else if (dir >= 78.75 && dir < 101.25) {
      windir = 'E';
    } else if (dir >= 101.25 && dir < 123.75) {
      windir = 'SEE';
    } else if (dir >= 123.75 && dir < 146.25) {
      windir = 'SE';
    } else if (dir >= 146.25 && dir < 168.75) {
      windir = 'SSE';
    } else if (dir >= 168.75 && dir < 191.25) {
      windir = 'S';
    } else if (dir >= 191.25 && dir < 213.75) {
      windir = 'SSW';
    } else if (dir >= 213.75 && dir < 236.25) {
      windir = 'SW';
    } else if (dir >= 236.25 && dir < 258.75) {
      windir = 'SWW';
    } else if (dir >= 258.75 && dir < 281.25) {
      windir = 'W';
    } else if (dir >= 281.25 && dir < 303.75) {
      windir = 'NWW';
    } else if (dir >= 303.75 && dir < 326.25) {
      windir = 'NW';
    } else if (dir >= 326.25 && dir < 348.75) {
      windir = 'NNW';
    } else {
      windir = 'Unknown'; // Default to 'Unknown' if out of range
    }
    return windir;
  };
  
  export default GetWindDir;