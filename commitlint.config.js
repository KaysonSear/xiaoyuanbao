module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0], // 允许中文
    'header-max-length': [2, 'always', 100],
  },
};
