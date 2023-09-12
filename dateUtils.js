// dateUtils.js
export function reverseDateFormat(dateString) {
    const [month, day] = dateString.split('/');
    return `${day}/${month}`;
}

const daysInMonth = [
    31, // January
    28, // February (consider leap years)
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31  // December
];
  
export function addOneDay(dateString) {
    const [day, month] = dateString.split('/');
    let newDay = parseInt(day) + 1;
    let newMonth = parseInt(month);
    
    // Check if we need to switch to the next month
    if (newDay > daysInMonth[newMonth - 1]) {
      newDay = 1;
      newMonth += 1;
    }
    
    // Check if we need to switch to the next year
    if (newMonth > 12) {
      newMonth = 1;
      // Increment the year as well
      // You need to implement this logic based on your requirements
    }
    
    // Format the new day and month as "dd/mm"
    return `${newDay.toString().padStart(2, '0')}/${newMonth.toString().padStart(2, '0')}`;
  }

  export function getNearestMonday(date) {
    const day = date.getDay();
    const daysUntilMonday = day === 1 ? 0 : day === 0 ? 6 : day - 1;
    const nearestMonday = new Date(date);
    nearestMonday.setDate(date.getDate() - daysUntilMonday);
    return nearestMonday;
  }