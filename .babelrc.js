module.exports = {
  presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
  plugins: [
    '@emotion',
    'babel-plugin-macros',
    ['styled-components', { ssr: true }],
  ],
}
