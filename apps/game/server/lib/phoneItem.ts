import { config } from '../config';
import { mainLogger } from '../sv_logger';

const phoneItemLogger = mainLogger.child({ module: 'phoneItem' });

export const hasPhoneItem = (source: number): boolean => {
  const { enabled, checkOnServer, exportResource, exportFunction, exportArgs } = config.PhoneAsItem;
  if (!enabled || !checkOnServer) return true;

  try {
    return !!global.exports[exportResource][exportFunction](source, ...(exportArgs ?? []));
  } catch (error) {
    phoneItemLogger.error(
      `PhoneAsItem server check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
};
