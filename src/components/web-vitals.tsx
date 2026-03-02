"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

function sendMetric(metric: Metric) {
  const payload = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
    timestamp: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", payload);
  } else {
    fetch("/api/vitals", {
      method: "POST",
      body: payload,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export function WebVitals() {
  useEffect(() => {
    onCLS(sendMetric);
    onINP(sendMetric);
    onLCP(sendMetric);
    onFCP(sendMetric);
    onTTFB(sendMetric);
  }, []);

  return null;
}
