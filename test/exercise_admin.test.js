const assert = require('assert');
const exerciseAdminModel = require('../models/exercise_admin');

async function runUnitTests() {
    console.log('--- Running Exercise Admin Unit Tests ---');
    try {
        // 1. Test createExercise
        const createRes = await exerciseAdminModel.createExercise(1, 'UnitTest Exercise Script', [
            { choice_script: 'Choice 1 (Correct)', isAnswer: 1 },
            { choice_script: 'Choice 2 (Incorrect)', isAnswer: 0 }
        ]);
        assert.strictEqual(createRes.isError, false, `createExercise should not return error: ${createRes.errorMessage}`);
        assert.ok(createRes.data.exercise_id, 'exercise_id should be returned');
        const testExId = createRes.data.exercise_id;
        console.log('✓ Test createExercise passed. Created ID:', testExId);

        // 2. Test updateExercise
        const updateRes = await exerciseAdminModel.updateExercise(testExId, 'UnitTest Exercise Script Updated', [
            { choice_script: 'Choice 1 Updated', isAnswer: 1 }
        ]);
        assert.strictEqual(updateRes.isError, false, `updateExercise should not return error: ${updateRes.errorMessage}`);
        console.log('✓ Test updateExercise passed.');

        // 3. Test changeExerciseStatus to 0 (Inactive)
        const statusRes0 = await exerciseAdminModel.changeExerciseStatus(testExId, 0);
        assert.strictEqual(statusRes0.isError, false, `changeExerciseStatus to 0 should succeed: ${statusRes0.errorMessage}`);
        assert.strictEqual(statusRes0.data.is_active, 0, 'status should be 0');
        console.log('✓ Test changeExerciseStatus (0 - Inactive) passed.');

        // 4. Test changeExerciseStatus back to 1 (Active)
        const statusRes1 = await exerciseAdminModel.changeExerciseStatus(testExId, 1);
        assert.strictEqual(statusRes1.isError, false, `changeExerciseStatus to 1 should succeed: ${statusRes1.errorMessage}`);
        assert.strictEqual(statusRes1.data.is_active, 1, 'status should be 1');
        console.log('✓ Test changeExerciseStatus (1 - Active) passed.');

        console.log('ALL UNIT TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Unit test failed:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runUnitTests();
}

module.exports = runUnitTests;
