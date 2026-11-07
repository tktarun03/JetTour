/* English only for v1. Every UI sentence goes through t() so a translation table can be added later.
   Placeholders: t('Saved {name}', { name }) — names stay out of the translated sentence. */
const I18N = {
  lang: 'en',
  table: {},
};
function t(str, vars) {
  const row = I18N.table[str];
  let out = (row && row[I18N.lang]) || str;
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  return out;
}
