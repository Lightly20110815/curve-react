import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  time?: Date;
}

export function AnalogClock({ className, time: providedTime }: Props) {
  const [time, setTime] = useState(providedTime ?? new Date());

  useEffect(() => {
    if (providedTime) {
      setTime(providedTime);
      return;
    }

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [providedTime]);

  const currentTime = providedTime ?? time;

  const secondsDegrees = currentTime.getSeconds() * 6;
  const minsDegrees = currentTime.getMinutes() * 6 + currentTime.getSeconds() * 0.1;
  const hoursDegrees = (currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5;

  return (
    <div className={cn("relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-ink bg-paper shadow-sm", className)}>
      <div className="absolute z-10 h-2 w-2 rounded-full bg-stamp" />
      
      <div 
        className="absolute bottom-1/2 left-1/2 w-1.5 origin-bottom -translate-x-1/2 rounded-full bg-ink"
        style={{ height: '30%', transform: `translateX(-50%) rotate(${hoursDegrees}deg)` }}
      />
      
      <div 
        className="absolute bottom-1/2 left-1/2 w-1 origin-bottom -translate-x-1/2 rounded-full bg-ink/80"
        style={{ height: '40%', transform: `translateX(-50%) rotate(${minsDegrees}deg)` }}
      />
      
      <div 
        className="absolute bottom-1/2 left-1/2 w-[2px] origin-bottom -translate-x-1/2 rounded-full bg-stamp"
        style={{ height: '45%', transform: `translateX(-50%) rotate(${secondsDegrees}deg)` }}
      />

      {[0, 90, 180, 270].map(deg => (
        <div 
          key={deg}
          className="absolute h-full w-full py-1.5"
          style={{ transform: `rotate(${deg}deg)` }}
        >
          <div className="mx-auto h-1.5 w-1 bg-ink/40" />
        </div>
      ))}
    </div>
  );
}
