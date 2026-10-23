import { runCodeTestCase } from '../services/compilerService.js';

async function main() {
  console.log('Testing Python...');
  const py = await runCodeTestCase('python', 'print("Python Output: " + str(25 * 4))');
  console.log('Python Result:', py.stdout, 'Success:', py.success);

  console.log('\nTesting C...');
  const c = await runCodeTestCase('c', '#include <stdio.h>\nint main(){ printf("C Output: 100\\n"); return 0; }');
  console.log('C Result:', c.stdout, 'Success:', c.success);

  console.log('\nTesting MySQL...');
  const sql = await runCodeTestCase('mysql', 'SELECT * FROM Employee');
  console.log('SQL Result:', sql.stdout, 'Success:', sql.success);
}

main();
