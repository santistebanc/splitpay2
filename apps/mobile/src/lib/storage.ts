import AsyncStorage from "@react-native-async-storage/async-storage";

import type { KeyValueStorage } from "./storage-types";

export type { KeyValueStorage } from "./storage-types";

export const defaultStorage: KeyValueStorage = AsyncStorage;
