/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { useEffect, type RefObject } from "react";
import type { AnyFunction, AnyJson } from "@w3ux/types";

// A hook that alerts clicks outside of the passed ref.
export const useOutsideAlerter = (
  ref: RefObject<HTMLElement>,
  callback: AnyFunction,
  ignore: string[] = []
) => {
  useEffect(() => {
    const handleClickOutside = (ev: AnyJson) => {
      if (ev) {
        if (ref.current && !ref.current.contains(ev.target as Node)) {
          const target = ev.target as HTMLElement;
          // Ignore tags with a name of `ignore`, or if there is a class of `ignore` in the parent
          // tree.
          const tagName = target.tagName.toLowerCase();
          const ignored = ignore.some(
            (i) =>
              i.toLowerCase() === tagName || target.closest(`.${i}`) !== null
          );

          if (!ignored) {
            callback();
          }
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};
