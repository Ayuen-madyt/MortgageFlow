export default function transformDateFormat(inputDate: string): string {
  const dateObject = new Date(inputDate);

  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');

  const transformedDate = `${day}/${month}/${year}`;

  return transformedDate;
}
