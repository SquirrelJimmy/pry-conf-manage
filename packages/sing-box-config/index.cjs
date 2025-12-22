const path = require('node:path');

const SCHEMA_FILES = {
  fullConfig: 'sing-box.config.full.jsonc',
  schema: 'sing-box.config.schema.json',
  templateSchema: 'sing-box.config.template.schema.json',
};

function schemaPath(name) {
  const filename = SCHEMA_FILES[name];
  if (!filename) {
    throw new Error(
      `[sing-box-config] unknown schema name: ${name}. Available: ${Object.keys(
        SCHEMA_FILES,
      ).join(', ')}`,
    );
  }
  return path.join(__dirname, 'schemas', filename);
}

function resolveSchemaPath(name) {
  return require.resolve(schemaPath(name));
}

module.exports = {
  SCHEMA_FILES,
  schemaPath,
  resolveSchemaPath,
};

