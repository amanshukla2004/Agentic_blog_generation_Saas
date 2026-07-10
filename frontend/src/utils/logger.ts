export const systemLog = (filename: string, fnName: string, action: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [FRONTEND] [${filename}:${fnName}] - ${action}`);
};
