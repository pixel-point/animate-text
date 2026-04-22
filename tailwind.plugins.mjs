import plugin from 'tailwindcss/plugin';

export default plugin(({ matchVariant }) => {
  matchVariant('part', (part) => `&::part(${part})`);
});
