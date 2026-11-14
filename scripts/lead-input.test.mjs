import test from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema } from '../src/lib/lead-input.ts';
const minimal = {mode:'interest',name:'프리뷰검수',phone:'01000000000',consent:true};
test('interest form accepts only name phone consent without fabricating identity fields',()=>{
  const parsed=leadSchema.parse(minimal);
  assert.equal(parsed.product,undefined);
  for(const key of ['birth6','sido','sigungu','dong']) assert.equal(parsed[key],'');
});
test('interest form refuses extra birth and address data',()=>{
  assert.equal(leadSchema.safeParse({...minimal,birth6:'730101'}).success,false);
});
test('full existing registration retains product, birth, address validation',()=>{
  assert.equal(leadSchema.safeParse({...minimal,mode:'full'}).success,false);
  assert.equal(leadSchema.safeParse({...minimal,mode:'full',product:'apt',birth6:'730101',sido:'인천광역시',sigungu:'서해구',dong:'청라동'}).success,true);
});
test('refused consent, invalid product and oversized name rejected',()=>{
  for(const variant of [{consent:false},{product:'unexpected'},{name:'가'.repeat(21)}]) assert.equal(leadSchema.safeParse({...minimal,...variant}).success,false);
});
