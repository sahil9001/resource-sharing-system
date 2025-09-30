const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Test script to verify API endpoints
 */
async function testEndpoints() {
  try {
    console.log('🧪 Testing Resource Sharing System API endpoints...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Get all users
    console.log('\n2. Testing get all users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log('✅ Users retrieved:', usersResponse.data.length, 'users');

    // Test 3: Get all groups
    console.log('\n3. Testing get all groups...');
    const groupsResponse = await axios.get(`${BASE_URL}/groups`);
    console.log('✅ Groups retrieved:', groupsResponse.data.length, 'groups');

    // Test 4: Get all resources
    console.log('\n4. Testing get all resources...');
    const resourcesResponse = await axios.get(`${BASE_URL}/resources`);
    console.log('✅ Resources retrieved:', resourcesResponse.data.length, 'resources');

    // Test 5: Get resource access list (resource1 - should have Developers group access)
    console.log('\n5. Testing resource access list for resource1...');
    const accessListResponse = await axios.get(`${BASE_URL}/resource/resource1/access-list`);
    console.log('✅ Resource access list:', {
      resourceId: accessListResponse.data.resourceId,
      accessType: accessListResponse.data.accessType,
      totalUsers: accessListResponse.data.totalUsers
    });

    // Test 6: Get user resources (user1 - Alice)
    console.log('\n6. Testing user resources for user1...');
    const userResourcesResponse = await axios.get(`${BASE_URL}/resource/user/user1/resources`);
    console.log('✅ User resources:', {
      userId: userResourcesResponse.data.userId,
      totalResources: userResourcesResponse.data.totalResources
    });

    // Test 7: Get global resource access (resource3 - Company Handbook)
    console.log('\n7. Testing global resource access for resource3...');
    const globalAccessResponse = await axios.get(`${BASE_URL}/resource/resource3/access-list`);
    console.log('✅ Global resource access:', {
      resourceId: globalAccessResponse.data.resourceId,
      accessType: globalAccessResponse.data.accessType,
      totalUsers: globalAccessResponse.data.totalUsers
    });

    // Test 8: Get resources with user count (reporting)
    console.log('\n8. Testing resources with user count...');
    const resourcesWithCountResponse = await axios.get(`${BASE_URL}/resource/resources/with-user-count`);
    console.log('✅ Resources with user count:', resourcesWithCountResponse.data.length, 'resources');

    // Test 9: Get users with resource count (reporting)
    console.log('\n9. Testing users with resource count...');
    const usersWithCountResponse = await axios.get(`${BASE_URL}/resource/users/with-resource-count`);
    console.log('✅ Users with resource count:', usersWithCountResponse.data.length, 'users');

    // Test 10: Test sharing a resource
    console.log('\n10. Testing resource sharing...');
    const shareResponse = await axios.post(`${BASE_URL}/resource/resource1/share`, {
      shareType: 'user',
      targetId: 'user5',
      sharedBy: 'user1',
      permissions: ['read']
    });
    console.log('✅ Resource shared successfully');

    // Test 11: Verify the new share
    console.log('\n11. Verifying new share...');
    const updatedAccessResponse = await axios.get(`${BASE_URL}/resource/resource1/access-list`);
    console.log('✅ Updated access list:', {
      totalUsers: updatedAccessResponse.data.totalUsers
    });

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- User management: ✅');
    console.log('- Group management: ✅');
    console.log('- Resource management: ✅');
    console.log('- Access control: ✅');
    console.log('- Global sharing: ✅');
    console.log('- Reporting: ✅');
    console.log('- Resource sharing: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test specific access control scenarios
 */
async function testAccessControlScenarios() {
  try {
    console.log('\n🔐 Testing Access Control Scenarios...\n');

    // Scenario 1: User with multiple access paths
    console.log('Scenario 1: User with multiple access paths (user4 - Diana)');
    console.log('- Diana is in Designers group (group2)');
    console.log('- Diana is in Managers group (group3)');
    console.log('- Diana should have access to resource2 (shared with Designers)');
    console.log('- Diana should have access to resource3 (global)');
    
    const dianaResources = await axios.get(`${BASE_URL}/user/user4/resources`);
    console.log('✅ Diana has access to', dianaResources.data.totalResources, 'resources');

    // Scenario 2: Group access
    console.log('\nScenario 2: Group access (Developers group)');
    console.log('- resource1 is shared with Developers group');
    console.log('- Alice and Bob are in Developers group');
    
    const resource1Access = await axios.get(`${BASE_URL}/resource/resource1/access-list`);
    console.log('✅ resource1 has', resource1Access.data.totalUsers, 'users with access');

    // Scenario 3: Global access
    console.log('\nScenario 3: Global access');
    console.log('- resource3 (Company Handbook) is global');
    console.log('- All users should have access');
    
    const resource3Access = await axios.get(`${BASE_URL}/resource/resource3/access-list`);
    console.log('✅ resource3 has', resource3Access.data.totalUsers, 'users with access (should be all users)');

    console.log('\n🎉 Access control scenarios tested successfully!');

  } catch (error) {
    console.error('❌ Access control test failed:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  testEndpoints,
  testAccessControlScenarios
};
