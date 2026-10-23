async function test() {
  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'gcc-13.2.0',
        code: '#include <iostream>\nint main(){ std::cout << "Hello C++ 42" << std::endl; return 0; }'
      })
    });
    const data = await res.json();
    console.log('Full data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
