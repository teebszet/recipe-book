"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

export function TrackRecentlyViewed({
  id,
  title,
  thumbnail,
}: {
  id: string;
  title: string;
  thumbnail: string | null;
}) {
  useEffect(() => {
    addRecentlyViewed({ id, title, thumbnail });
  }, [id, title, thumbnail]);

  return null;
}
