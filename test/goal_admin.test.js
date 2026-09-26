const assert = require('assert');
const goalAdminModel = require('../models/goal_admin');

async function runUnitTests() {
    console.log('--- Running Goal Admin Unit Tests (Many-to-Many Skill Binding) ---');
    try {
        // 1. Create Goal with skill_ids [1, 2]
        const createRes = await goalAdminModel.createGoal('FULLSTACK_DEV', 'UnitTest Fullstack Developer Goal', 1, [1, 2]);
        assert.strictEqual(createRes.isError, false, `createGoal error: ${createRes.errorMessage}`);
        assert.ok(createRes.data.goal_id, 'goal_id should be returned');
        const testGoalId = createRes.data.goal_id;
        console.log('✓ Test createGoal passed. Created Goal ID:', testGoalId);

        // 2. Get Goal By ID
        const getRes = await goalAdminModel.getGoalById(testGoalId);
        assert.strictEqual(getRes.isError, false, 'getGoalById should succeed');
        assert.strictEqual(getRes.data.goal_code, 'FULLSTACK_DEV');
        assert.ok(Array.isArray(getRes.data.skills), 'skills should be an array');
        console.log('✓ Test getGoalById passed. Associated skills count:', getRes.data.skills.length);

        // 3. Get All Goals
        const getAllRes = await goalAdminModel.getAllGoals();
        assert.strictEqual(getAllRes.isError, false, 'getAllGoals should succeed');
        assert.ok(Array.isArray(getAllRes.data), 'data should be an array');
        console.log('✓ Test getAllGoals passed. Total goals:', getAllRes.data.length);

        // 4. Update Goal with skill_ids [2, 3]
        const updateRes = await goalAdminModel.updateGoal(testGoalId, 'FULLSTACK_DEV_UPDATED', 'UnitTest Goal Updated', 1, [2, 3]);
        assert.strictEqual(updateRes.isError, false, 'updateGoal should succeed');
        console.log('✓ Test updateGoal passed.');

        // 5. Change Status to Inactive (0)
        const statusRes0 = await goalAdminModel.changeGoalStatus(testGoalId, 0);
        assert.strictEqual(statusRes0.isError, false, 'changeGoalStatus to 0 should succeed');
        assert.strictEqual(statusRes0.data.is_active, 0);
        console.log('✓ Test changeGoalStatus (0 - Inactive) passed.');

        // 6. Change Status to Active (1)
        const statusRes1 = await goalAdminModel.changeGoalStatus(testGoalId, 1);
        assert.strictEqual(statusRes1.isError, false, 'changeGoalStatus to 1 should succeed');
        assert.strictEqual(statusRes1.data.is_active, 1);
        console.log('✓ Test changeGoalStatus (1 - Active) passed.');

        // 7. Delete Goal
        const delRes = await goalAdminModel.deleteGoal(testGoalId);
        assert.strictEqual(delRes.isError, false, 'deleteGoal should succeed');
        console.log('✓ Test deleteGoal passed.');

        console.log('ALL GOAL ADMIN UNIT TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Goal Admin unit test failed:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runUnitTests();
}

module.exports = runUnitTests;
