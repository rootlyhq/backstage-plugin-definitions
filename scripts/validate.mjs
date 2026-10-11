// Validates every catalog definition under definitions/ against the
// Backstage catalog model so broken examples fail CI.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseAllDocuments } from 'yaml';
import {
  apiEntityV1alpha1Validator,
  componentEntityV1alpha1Validator,
  domainEntityV1alpha1Validator,
  groupEntityV1alpha1Validator,
  locationEntityV1alpha1Validator,
  resourceEntityV1alpha1Validator,
  systemEntityV1alpha1Validator,
  userEntityV1alpha1Validator,
  DefaultNamespaceEntityPolicy,
  FieldFormatEntityPolicy,
  NoForeignRootFieldsEntityPolicy,
  SchemaValidEntityPolicy,
  EntityPolicies,
} from '@backstage/catalog-model';

const validators = [
  apiEntityV1alpha1Validator,
  componentEntityV1alpha1Validator,
  domainEntityV1alpha1Validator,
  groupEntityV1alpha1Validator,
  locationEntityV1alpha1Validator,
  resourceEntityV1alpha1Validator,
  systemEntityV1alpha1Validator,
  userEntityV1alpha1Validator,
];

const policy = EntityPolicies.allOf([
  new DefaultNamespaceEntityPolicy(),
  new NoForeignRootFieldsEntityPolicy(),
  new FieldFormatEntityPolicy(),
  new SchemaValidEntityPolicy(),
]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.ya?ml$/.test(entry.name)) yield path;
  }
}

let failures = 0;
let count = 0;

for await (const file of walk('definitions')) {
  const docs = parseAllDocuments(await readFile(file, 'utf8'));
  for (const doc of docs) {
    if (doc.errors.length) {
      failures++;
      console.error(`✗ ${file}: ${doc.errors.map(e => e.message).join(', ')}`);
      continue;
    }
    const entity = doc.toJS();
    if (!entity) continue;
    count++;
    const label = `${file} (${entity.kind}:${entity.metadata?.name})`;
    try {
      await policy.enforce(entity);
      const results = await Promise.all(validators.map(v => v.check(entity)));
      if (!results.some(Boolean)) {
        throw new Error(`unknown kind ${entity.apiVersion}/${entity.kind}`);
      }
      console.log(`✓ ${label}`);
    } catch (e) {
      failures++;
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

console.log(`\n${count} entities checked, ${failures} failed`);
process.exit(failures ? 1 : 0);
