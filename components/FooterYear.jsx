"use client";
import React, { useState, useEffect } from "react";

const FooterYear = React.memo(function FooterYear() {
  const [year, setYear] = useState(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
});

FooterYear.displayName = 'FooterYear';
export default FooterYear;
