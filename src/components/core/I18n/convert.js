import { formatMessage } from 'umi/locale';

export function convertCode(code, interpolates) {
  return formatMessage(
    {
      id: code
        ? `${code
            .split('_') // ^_^
            .map(item => item.toLowerCase())
            .join('.')}`
        : 'ng',
      defaultMessage: code,
    },
    interpolates
  );
}
