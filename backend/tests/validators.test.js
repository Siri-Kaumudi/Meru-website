/**
 * Server-side validation tests
 * Run: cd backend && node tests/validators.test.js
 */

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌  ${name}: ${err.message}`);
    failed++;
  }
}

function expect(val) {
  return {
    toBe: (expected) => { if (val !== expected) throw new Error(`Expected ${expected}, got ${val}`); },
    toMatch: (regex) => { if (!regex.test(val)) throw new Error(`"${val}" does not match ${regex}`); },
    toBeTruthy: () => { if (!val) throw new Error(`Expected truthy, got ${val}`); },
    toBeFalsy: () => { if (val) throw new Error(`Expected falsy, got ${val}`); },
    toBeGreaterThan: (n) => { if (val <= n) throw new Error(`Expected > ${n}, got ${val}`); },
  };
}

// Mobile validation
const validMobile = (m) => /^[6-9]\d{9}$/.test(m);

console.log('\n📱 Mobile Number Validation Tests');
test('valid mobile 9876543210', () => expect(validMobile('9876543210')).toBeTruthy());
test('valid mobile 6123456789', () => expect(validMobile('6123456789')).toBeTruthy());
test('invalid mobile - starts with 1', () => expect(validMobile('1234567890')).toBeFalsy());
test('invalid mobile - 9 digits', () => expect(validMobile('987654321')).toBeFalsy());
test('invalid mobile - 11 digits', () => expect(validMobile('98765432101')).toBeFalsy());
test('invalid mobile - letters', () => expect(validMobile('9876ABCD90')).toBeFalsy());
test('invalid mobile - empty', () => expect(validMobile('')).toBeFalsy());

// Aadhaar validation
const validAadhaar = (a) => /^\d{12}$/.test(a);

console.log('\n🪪 Aadhaar Validation Tests');
test('valid aadhaar 12 digits', () => expect(validAadhaar('123456789012')).toBeTruthy());
test('invalid aadhaar 11 digits', () => expect(validAadhaar('12345678901')).toBeFalsy());
test('invalid aadhaar letters', () => expect(validAadhaar('1234567890AB')).toBeFalsy());
test('empty aadhaar (optional - allowed)', () => expect(validAadhaar('')).toBeFalsy()); // empty handled separately

// Pin code validation
const validPin = (p) => /^\d{6}$/.test(p);

console.log('\n📮 Pin Code Validation Tests');
test('valid pin 500001', () => expect(validPin('500001')).toBeTruthy());
test('invalid pin 5 digits', () => expect(validPin('50000')).toBeFalsy());
test('invalid pin letters', () => expect(validPin('5000AB')).toBeFalsy());

// Age validation
const validAge = (a) => !isNaN(Number(a)) && Number(a) >= 0 && Number(a) <= 120;

console.log('\n👤 Age Validation Tests');
test('valid age 25', () => expect(validAge(25)).toBeTruthy());
test('valid age 0 (infant)', () => expect(validAge(0)).toBeTruthy());
test('valid age 120', () => expect(validAge(120)).toBeTruthy());
test('invalid age -1', () => expect(validAge(-1)).toBeFalsy());
test('invalid age 121', () => expect(validAge(121)).toBeFalsy());
test('invalid age NaN', () => expect(validAge('abc')).toBeFalsy());

// Name validation
const validName = (n) => n && n.trim().length >= 2 && n.trim().length <= 100;

console.log('\n📝 Name Validation Tests');
test('valid name "రాము"', () => expect(validName('రాము')).toBeTruthy());
test('valid name "Ramesh Kumar"', () => expect(validName('Ramesh Kumar')).toBeTruthy());
test('invalid name - empty', () => expect(validName('')).toBeFalsy());
test('invalid name - 1 char', () => expect(validName('A')).toBeFalsy());
test('invalid name - too long', () => expect(validName('A'.repeat(101))).toBeFalsy());

// Gender validation
const VALID_GENDERS = ['పురుషుడు', 'స్త్రీ'];
const validGender = (g) => VALID_GENDERS.includes(g);

console.log('\n⚥ Gender Validation Tests');
test('valid gender పురుషుడు', () => expect(validGender('పురుషుడు')).toBeTruthy());
test('valid gender స్త్రీ', () => expect(validGender('స్త్రీ')).toBeTruthy());
test('invalid gender Other', () => expect(validGender('Other')).toBeFalsy());
test('invalid gender empty', () => expect(validGender('')).toBeFalsy());

// Member count validation
const validMemberCount = (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 8;

console.log('\n👨‍👩‍👧‍👦 Member Count Validation Tests');
test('valid 1 member', () => expect(validMemberCount([{}])).toBeTruthy());
test('valid 8 members', () => expect(validMemberCount(new Array(8).fill({}))).toBeTruthy());
test('invalid 0 members', () => expect(validMemberCount([])).toBeFalsy());
test('invalid 9 members', () => expect(validMemberCount(new Array(9).fill({}))).toBeFalsy());
test('invalid not array', () => expect(validMemberCount(null)).toBeFalsy());

// Summary
console.log(`\n${'─'.repeat(40)}`);
console.log(`Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
if (failed > 0) {
  console.log('Some tests FAILED!');
  process.exit(1);
} else {
  console.log('All tests PASSED! 🎉');
}
