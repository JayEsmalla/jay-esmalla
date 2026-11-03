import { useEffect, useState } from "react";

const TIME_ZONE = "Asia/Manila";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export type ActivityMode = "sleeping" | "studying" | "workout" | "coding";

export interface LocalTimeSnapshot {
  time: string;
  hour: number;
  minute: number;
  awake: boolean;
  activity: ActivityMode;
  label: string;
  status: string;
  sticker: string;
}

export function formatManilaTime(date: Date = new Date()): LocalTimeSnapshot {
  const time = timeFormatter.format(date);
  const [rawHour, rawMinute] = time.split(":").map((part) => Number.parseInt(part, 10));
  const hour = Number.isFinite(rawHour) ? rawHour % 24 : 12;
  const minute = Number.isFinite(rawMinute) ? rawMinute % 60 : 0;
  const totalMinutes = hour * 60 + minute;

  // 00:00–07:00 Sleeping · 07:00–15:00 Studying · 15:00–17:30 Workout · 17:30–24:00 Coding
  if (totalMinutes < 7 * 60) {
    return {
      time,
      hour,
      minute,
      awake: false,
      activity: "sleeping",
      label: "SLEEPING",
      status: "Asleep · replies by morning",
      sticker: "/stickers/sleeping.webp",
    };
  }
  if (totalMinutes < 15 * 60) {
    return {
      time,
      hour,
      minute,
      awake: true,
      activity: "studying",
      label: "STUDYING",
      status: "Studying · CS & AI",
      sticker: "/stickers/studying.webp",
    };
  }
  if (totalMinutes < 17 * 60 + 30) {
    return {
      time,
      hour,
      minute,
      awake: true,
      activity: "workout",
      label: "WORKOUT",
      status: "At the gym · back soon",
      sticker: "/stickers/workout.webp",
    };
  }
  return {
    time,
    hour,
    minute,
    awake: true,
    activity: "coding",
    label: "CODING",
    status: "Coding · replies same day",
    sticker: "/stickers/coding.webp",
  };
}

export function useLocalTime(): LocalTimeSnapshot {
  const [snapshot, setSnapshot] = useState<LocalTimeSnapshot>(() => formatManilaTime());

  useEffect(() => {
    const update = () => setSnapshot(formatManilaTime());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return snapshot;
}
