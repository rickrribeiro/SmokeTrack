const getLocalISOString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISO = new Date(now.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);
  return localISO;
};

export {
    getLocalISOString
}