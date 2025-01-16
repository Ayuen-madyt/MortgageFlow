export default function formatDateString(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date object provided');
  }

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short',
  };

  try {
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedParts = formatter.formatToParts(date);
    let formattedDate = '';
    let timeZone = '';

    formattedParts.forEach(({ type, value }) => {
      switch (type) {
        case 'day':
        case 'month':
        case 'year':
          formattedDate += `${value}/`;
          break;
        case 'hour':
          formattedDate = formattedDate.slice(0, -1); // Remove trailing "/"
          formattedDate += ` ${value}:`;
          break;
        case 'minute':
          formattedDate += `${value} `;
          break;
        case 'dayPeriod':
          formattedDate += `${value} `;
          break;
        case 'timeZoneName':
          timeZone = value;
          break;
        default:
          break;
      }
    });

    return `${formattedDate}${timeZone}`.trim();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}
