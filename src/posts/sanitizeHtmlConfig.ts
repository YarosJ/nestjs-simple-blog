import { defaults } from 'sanitize-html';

const { allowedTags, allowedAttributes } = defaults;

export default {
  allowedTags: [...allowedTags, 'img', 'figure'],
  allowedAttributes: {
    ...allowedAttributes,
    figure: ['class'],
  },
};
