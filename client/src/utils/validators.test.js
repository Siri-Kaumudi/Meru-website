/**
 * Client-side validator tests
 * Run: node src/utils/validators.test.js  (from client folder, after removing ES module imports)
 */

import { validateHousehold, validateMember, validateAllMembers } from './validators.js';

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
    toBe: (expected) => { if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`); },
    toHaveKey: (k) => { if (!(k in val)) throw new Error(`Expected key "${k}" in ${JSON.stringify(Object.keys(val))}`); },
    notToHaveKey: (k) => { if (k in val) throw new Error(`Did not expect key "${k}"`); },
    toBeEmpty: () => { if (Object.keys(val).length > 0) throw new Error(`Expected empty, got ${JSON.stringify(val)}`); },
  };
}

// --- validateHousehold ---
console.log('\n🏠 Household Validation Tests');

test('passes with valid household', () => {
  const errs = validateHousehold({ village: 'హైదరాబాద్', mandal: 'సికింద్రాబాద్', district: 'హైదరాబాద్' });
  expect(errs).toBeEmpty();
});

test('fails with missing village', () => {
  const errs = validateHousehold({ village: '', mandal: 'సికింద్రాబాద్', district: 'హైదరాబాద్' });
  expect(errs).toHaveKey('village');
});

test('fails with missing mandal', () => {
  const errs = validateHousehold({ village: 'హైదరాబాద్', mandal: '', district: 'హైదరాబాద్' });
  expect(errs).toHaveKey('mandal');
});

test('fails with missing district', () => {
  const errs = validateHousehold({ village: 'హైదరాబాద్', mandal: 'సికింద్రాబాద్', district: '' });
  expect(errs).toHaveKey('district');
});

test('passes optional ration card not provided', () => {
  const errs = validateHousehold({ village: 'హైదరాబాద్', mandal: 'సికింద్రాబాద్', district: 'హైదరాబాద్', rationCardNo: '' });
  expect(errs).notToHaveKey('rationCardNo');
});

test('fails invalid ration card format', () => {
  const errs = validateHousehold({ village: 'హైదరాబాద్', mandal: 'సికింద్రాబాద్', district: 'హైదరాబాద్', rationCardNo: '!@#' });
  expect(errs).toHaveKey('rationCardNo');
});

// --- validateMember ---
console.log('\n👤 Member Validation Tests');

const validMember = {
  name: 'రాముడు',
  age: 30,
  gender: 'పురుషుడు',
  relationshipWithHead: 'కుటుంబయజమాని',
  aadhaarNo: '',
  mobileNo: '',
};

test('passes valid member', () => {
  const errs = validateMember(validMember, 0);
  expect(errs).toBeEmpty();
});

test('fails missing name', () => {
  const errs = validateMember({ ...validMember, name: '' }, 0);
  expect(errs).toHaveKey('member_0_name');
});

test('fails short name (1 char)', () => {
  const errs = validateMember({ ...validMember, name: 'A' }, 0);
  expect(errs).toHaveKey('member_0_name');
});

test('fails missing age', () => {
  const errs = validateMember({ ...validMember, age: '' }, 0);
  expect(errs).toHaveKey('member_0_age');
});

test('fails age > 120', () => {
  const errs = validateMember({ ...validMember, age: 150 }, 0);
  expect(errs).toHaveKey('member_0_age');
});

test('fails negative age', () => {
  const errs = validateMember({ ...validMember, age: -5 }, 0);
  expect(errs).toHaveKey('member_0_age');
});

test('passes age 0 (infant)', () => {
  const errs = validateMember({ ...validMember, age: 0 }, 0);
  expect(errs).notToHaveKey('member_0_age');
});

test('fails missing gender', () => {
  const errs = validateMember({ ...validMember, gender: '' }, 0);
  expect(errs).toHaveKey('member_0_gender');
});

test('fails missing relationship', () => {
  const errs = validateMember({ ...validMember, relationshipWithHead: '' }, 0);
  expect(errs).toHaveKey('member_0_relationshipWithHead');
});

test('fails invalid aadhaar (11 digits)', () => {
  const errs = validateMember({ ...validMember, aadhaarNo: '12345678901' }, 0);
  expect(errs).toHaveKey('member_0_aadhaarNo');
});

test('passes valid aadhaar (12 digits)', () => {
  const errs = validateMember({ ...validMember, aadhaarNo: '123456789012' }, 0);
  expect(errs).notToHaveKey('member_0_aadhaarNo');
});

test('passes empty aadhaar (optional)', () => {
  const errs = validateMember({ ...validMember, aadhaarNo: '' }, 0);
  expect(errs).notToHaveKey('member_0_aadhaarNo');
});

test('fails invalid mobile (starts with 1)', () => {
  const errs = validateMember({ ...validMember, mobileNo: '1234567890' }, 0);
  expect(errs).toHaveKey('member_0_mobileNo');
});

test('passes valid mobile', () => {
  const errs = validateMember({ ...validMember, mobileNo: '9876543210' }, 0);
  expect(errs).notToHaveKey('member_0_mobileNo');
});

test('passes empty mobile (optional)', () => {
  const errs = validateMember({ ...validMember, mobileNo: '' }, 0);
  expect(errs).notToHaveKey('member_0_mobileNo');
});

// --- validateAllMembers ---
console.log('\n👨‍👩‍👧 All Members Validation Tests');

test('passes multiple valid members', () => {
  const members = [
    { ...validMember, mobileNo: '9876543210' },
    { ...validMember, name: 'లక్ష్మి', relationshipWithHead: 'భార్య', mobileNo: '8765432109' },
  ];
  const errs = validateAllMembers(members);
  expect(errs).toBeEmpty();
});

test('catches duplicate mobile in same family', () => {
  const members = [
    { ...validMember, mobileNo: '9876543210' },
    { ...validMember, name: 'లక్ష్మి', relationshipWithHead: 'భార్య', mobileNo: '9876543210' },
  ];
  const errs = validateAllMembers(members);
  expect(errs).toHaveKey('member_1_mobileNo');
});

test('allows multiple members with empty mobile', () => {
  const members = [
    { ...validMember, mobileNo: '' },
    { ...validMember, name: 'లక్ష్మి', relationshipWithHead: 'భార్య', mobileNo: '' },
  ];
  const errs = validateAllMembers(members);
  expect(errs).notToHaveKey('member_0_mobileNo');
  expect(errs).notToHaveKey('member_1_mobileNo');
});

// Summary
console.log(`\n${'─'.repeat(40)}`);
console.log(`Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
