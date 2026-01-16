export const checkObjectStructure = (received: any, expected: any) => {
  const keys = Object.keys(expected);
  return keys.every((key) => key in received);
};

export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExtension.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
  return `${timestamp}-${sanitizedName}.${extension}`;
};
