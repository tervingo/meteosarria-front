export default function GetHumColor(humidity) {
  if (humidity >= 80) {
    return 'navy'; 
  } else if (humidity >= 60) {
    return 'dodgerblue'; 
  } else if (humidity >= 40) {
    return 'chartreuse'; 
  } else if (humidity >= 20) {
    return 'gold'; 
  } else {
    return 'orangered'; 
  }
} 
