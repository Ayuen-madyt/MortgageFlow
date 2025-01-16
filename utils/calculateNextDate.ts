export default function calculateNextDate(numberOfDays: number): Date {
  const currentDate = new Date();
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + numberOfDays);

  return nextDate;
}
