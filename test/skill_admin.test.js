const assert = require('assert');
const skillAdminModel = require('../models/skill_admin');

async function runUnitTests() {
    console.log('--- Running Skill Admin Unit Tests ---');
    try {
        // 1. Create Skill
        const createRes = await skillAdminModel.createSkill('TEST_ARRAYS', 'UnitTest Skill Arrays & Linked Lists', 1);
        assert.strictEqual(createRes.isError, false, `createSkill error: ${createRes.errorMessage}`);
        assert.ok(createRes.data.skill_id, 'skill_id should be returned');
        const testSkillId = createRes.data.skill_id;
        console.log('✓ Test createSkill passed. Created Skill ID:', testSkillId);

        // 2. Get Skill By ID
        const getRes = await skillAdminModel.getSkillById(testSkillId);
        assert.strictEqual(getRes.isError, false, 'getSkillById should succeed');
        assert.strictEqual(getRes.data.skill_code, 'TEST_ARRAYS');
        console.log('✓ Test getSkillById passed.');

        // 3. Get All Skills
        const getAllRes = await skillAdminModel.getAllSkills();
        assert.strictEqual(getAllRes.isError, false, 'getAllSkills should succeed');
        assert.ok(Array.isArray(getAllRes.data), 'data should be an array');
        console.log('✓ Test getAllSkills passed. Total skills:', getAllRes.data.length);

        // 4. Update Skill
        const updateRes = await skillAdminModel.updateSkill(testSkillId, 'TEST_ARRAYS_UPDATED', 'UnitTest Skill Updated', 1);
        assert.strictEqual(updateRes.isError, false, 'updateSkill should succeed');
        console.log('✓ Test updateSkill passed.');

        // 5. Change Status to Inactive (0)
        const statusRes0 = await skillAdminModel.changeSkillStatus(testSkillId, 0);
        assert.strictEqual(statusRes0.isError, false, 'changeSkillStatus to 0 should succeed');
        assert.strictEqual(statusRes0.data.is_active, 0);
        console.log('✓ Test changeSkillStatus (0 - Inactive) passed.');

        // 6. Change Status to Active (1)
        const statusRes1 = await skillAdminModel.changeSkillStatus(testSkillId, 1);
        assert.strictEqual(statusRes1.isError, false, 'changeSkillStatus to 1 should succeed');
        assert.strictEqual(statusRes1.data.is_active, 1);
        console.log('✓ Test changeSkillStatus (1 - Active) passed.');

        // 7. Delete Skill
        const delRes = await skillAdminModel.deleteSkill(testSkillId);
        assert.strictEqual(delRes.isError, false, 'deleteSkill should succeed');
        console.log('✓ Test deleteSkill passed.');

        console.log('ALL SKILL ADMIN UNIT TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Skill Admin unit test failed:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runUnitTests();
}

module.exports = runUnitTests;
