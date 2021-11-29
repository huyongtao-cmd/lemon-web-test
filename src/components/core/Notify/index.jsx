import { notification } from 'antd';
import { formatMessage } from 'umi/locale';
import { interpolate } from '@/utils/stringUtils';

const createNotify = ({ title = 'misc.hint', code, content, interpolates = {}, type = 'info' }) =>
  notification[type]({
    message: formatMessage({ id: title, defaultMessage: 'Prompt:' }),
    description:
      content ||
      formatMessage(
        {
          id: `${code
            .split('_') // ^_^
            .map(item => item.toLowerCase())
            .join('.')}`,
          defaultMessage: code,
        },
        interpolates
      ),
  });

['info', 'success', 'warning', 'error'].forEach(method => {
  createNotify[method] = params =>
    createNotify({
      ...params,
      type: method,
    });
});

// TODO: 这块还没设计好 所以先export一个function 以后用class
// eslint-disable-next-line
export { createNotify };
