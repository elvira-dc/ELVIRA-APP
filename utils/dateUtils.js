import { MONTH_NAMES } from "../constants/theme";

/**
 * Date utility functions for calendar operations
 */

export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isSameMonth = (date, currentDate) => {
  return (
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  );
};

export const generateMonthDays = (currentDate) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

export const generateWeekDays = (currentDate) => {
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push(date);
  }
  return days;
};

export const getMonthYearDisplay = (date) => {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};

export const getWeekRangeDisplay = (currentDate) => {
  const weekDays = generateWeekDays(currentDate);
  const startDate = weekDays[0];
  const endDate = weekDays[6];

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${
      MONTH_NAMES[startDate.getMonth()]
    } ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
  } else {
    return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()} - ${
      MONTH_NAMES[endDate.getMonth()]
    } ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }
};

export const navigateDate = (currentDate, direction, viewMode) => {
  const newDate = new Date(currentDate);

  if (viewMode === "month") {
    const monthDelta = direction === "next" ? 1 : -1;
    newDate.setMonth(newDate.getMonth() + monthDelta);
  } else {
    const dayDelta = direction === "next" ? 7 : -7;
    newDate.setDate(newDate.getDate() + dayDelta);
  }

  return newDate;
};
