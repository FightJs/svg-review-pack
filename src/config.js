export function effectiveConfig(text) {
  let value;
  try { value = JSON.parse(text || '{}'); } catch { throw new Error('配置不是有效的 JSON'); }
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('配置必须是 JSON 对象');
  for (const key of Object.keys(value)) if (!['floatPrecision', 'multipass'].includes(key)) throw new Error(`不支持配置字段：${key}`);
  const floatPrecision = value.floatPrecision ?? 3;
  const multipass = value.multipass ?? false;
  if (!Number.isInteger(floatPrecision) || floatPrecision < 0 || floatPrecision > 6 || value.floatPrecision === null) throw new Error('floatPrecision 必须是 0–6 的整数');
  if (typeof multipass !== 'boolean' || value.multipass === null) throw new Error('multipass 必须是布尔值');
  return { path:'input.svg', plugins:['preset-default'], floatPrecision, multipass, js2svg:{eol:'lf',pretty:false} };
}
