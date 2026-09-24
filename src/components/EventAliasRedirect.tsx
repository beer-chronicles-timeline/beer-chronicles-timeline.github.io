"use client";

import { useEffect } from "react";

export default function EventAliasRedirect({ href }: { href: string }) {
  useEffect(() => {
    // The destination is generated from the current event, never user input.
    window.location.replace(href + window.location.search + window.location.hash);
  }, [href]);
  return null;
}
