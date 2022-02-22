import { writable } from "svelte/store";

const { subscribe, set } = writable(localStorage.getItem("colorblind") === "true" ? true : false);
export const colorblind = {
  subscribe,
  set(value: boolean) {
    localStorage.setItem("colorblind", String(value));
    set(value);
  }
}