/**
 * Function to extract a short research type from a potentially longer string
 * @param value 
 * @returns 
 */
export const shortResearchType = (value?: string) => {
  if (!value) {
    return "-";
  }
  const chunk = value.split("/")[0]?.trim();
  return chunk && chunk.length > 0 ? chunk : value;
};