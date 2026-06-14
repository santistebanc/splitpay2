import "./src/polyfills";
import "@azure/core-asynciterator-polyfill";

import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
