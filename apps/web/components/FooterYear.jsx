"use client";
import { useState, useEffect } from "react";

export default function FooterYear() {
  const [year, setYear] = useState(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}
