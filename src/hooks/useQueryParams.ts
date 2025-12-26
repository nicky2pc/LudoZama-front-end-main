import { useEffect, useState } from "react";

/**
 * A hook that extracts and processes URL query parameters.
 * @returns An object containing all query parameters as key-value pairs.
 */
export function useQueryParams() {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string> = {};

    params.forEach((value, key) => {
      paramsObject[key] = value;
    });

    setQueryParams(paramsObject);
  }, []);

  return queryParams;
}
