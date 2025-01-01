import React, { ChangeEventHandler } from "react";

import { setHours, setMinutes } from "date-fns";
import { DayPicker } from "react-day-picker";
import "./DateTimePicker.css"; // Your custom styles

interface DateTimePickerProps {
  dateValue: Date | undefined;
  setDateValue: React.Dispatch<React.SetStateAction<Date | undefined>>;
  timeValue: string;
  setTimeValue: React.Dispatch<React.SetStateAction<string>>;
}

// Copied from: https://daypicker.dev/guides/timepicker
export function DateTimePicker({
  dateValue,
  setDateValue,
  timeValue,
  setTimeValue,
  isDarkMode,
}: DateTimePickerProps & { isDarkMode: boolean }) {
  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!dateValue) {
      setTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(dateValue, minutes), hours);
    setDateValue(newSelectedDate);
    setTimeValue(time);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!timeValue || !date) {
      setDateValue(date);
      return;
    }
    const [hours, minutes] = timeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setDateValue(newDate);
  };

  const darkTheme = {
    backgroundColor: "#2c3e50",
    color: "#ecf0f1",
    "--rdp-accent-color": "yellow",
    "--rdp-accent-background-color": "black",
    "--rdp-hover-color": "#e0e0e0",
    "--rdp-selected-color": "yellow",
  } as React.CSSProperties;
  return (
    <div style={isDarkMode ? { backgroundColor: "#2c3e50" } : undefined}>
      <form style={{ marginBlockEnd: "1em" }}>
        <label>
          Set the time:{" "}
          <input type="time" value={timeValue} onChange={handleTimeChange} />
        </label>
      </form>
      <DayPicker
        mode="single"
        selected={dateValue}
        onSelect={handleDaySelect}
        footer={`Selected date: ${
          dateValue ? dateValue.toLocaleString() : "none"
        }`}
        style={isDarkMode ? darkTheme : undefined}
      />
    </div>
  );
}

export default DateTimePicker;
