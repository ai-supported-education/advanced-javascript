const DEFAULT_PREFERENCES = {
  theme: "light",
  pageSize: 20
};

export function mergePreferences(input) {
  const result = { ...DEFAULT_PREFERENCES };

  for (const key in input) {
    result[key] = input[key];
  }

  return result;
}
