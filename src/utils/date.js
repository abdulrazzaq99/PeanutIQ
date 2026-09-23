export const formatDate = (timestamp, timezone = 'UTC') => {
  if (!timestamp) return '-';
  
  // If the timestamp from backend doesn't end with Z, append it so it's treated as UTC
  let dtString = timestamp;
  if (!dtString.endsWith('Z')) {
    dtString += 'Z';
  }
  
  const date = new Date(dtString);
  
  try {
    return date.toLocaleString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.error(`Invalid timezone: ${timezone}`, e);
    return date.toLocaleString();
  }
};
