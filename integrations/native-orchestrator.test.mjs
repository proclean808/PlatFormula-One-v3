import test from 'node:test';import assert from 'node:assert/strict';import {chooseRoute,plan} from './native-orchestrator.mjs';
test('unverified Gemini route blocked',()=>assert.equal(chooseRoute({device:'s25',capability:'settings.inspect'},[{device:'s25',capability:'settings.inspect',adapter:'gemini',available:true,verified:false}]),null));
test('verified route still requires authorization',()=>assert.equal(plan({device:'s26',capability:'apps.inventory'},[{device:'s26',capability:'apps.inventory',adapter:'native',available:true,verified:true}]).state,'AWAITING_AUTHORIZATION'));
test('cross-device route blocked',()=>assert.equal(plan({device:'s25',capability:'ui.operate'},[{device:'s26',capability:'ui.operate',adapter:'ui',available:true,verified:true}]).state,'BLOCKED'));
