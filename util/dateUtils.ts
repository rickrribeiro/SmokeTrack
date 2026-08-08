import { formatDuration } from './duration';

const getLocalISOString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISO = new Date(now.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);
  return localISO;
};

// dateTime1 é sempre o timestamp mais recente nos usos atuais (RegisterScreen).
const getTimeDifferenceText = (dateTime1, dateTime2) => {
    return formatDuration(dateTime1 - dateTime2);
}

const getDaysDifference = (dateTime1, dateTime2) => {
  const diffMs = dateTime1 - dateTime2;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export {
    getLocalISOString,
    getTimeDifferenceText,
    getDaysDifference
}