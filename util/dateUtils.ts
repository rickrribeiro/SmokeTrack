const getLocalISOString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISO = new Date(now.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);
  return localISO;
};

const getTimeDifferenceText = (dateTime1, dateTime2) => {
    const diffMs = dateTime1 - dateTime2;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
}

export {
    getLocalISOString,
    getTimeDifferenceText
}