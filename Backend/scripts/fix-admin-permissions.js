const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminPermissions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('🔍 현재 관리자 계정 상태 확인 중...');

    // 1. 현재 관리자 계정 조회
    const [admins] = await connection.execute(`
      SELECT 
        a.admin_id,
        a.login_id,
        a.name,
        a.email,
        al.level_code,
        al.level_name,
        t.team_name
      FROM admin a
      LEFT JOIN admin_level al ON a.admin_level_id = al.level_id
      LEFT JOIN team t ON a.team_id = t.team_id
      WHERE a.is_active = 1
    `);

    console.log('📊 현재 관리자 계정 목록:');
    admins.forEach((admin) => {
      console.log(
        `- ${admin.login_id} (${admin.name}): ${admin.level_code} - ${admin.level_name} [팀: ${admin.team_name || '없음'}]`,
      );
    });

    // 2. SUPER_ADMIN 권한 레벨 ID 확인
    const [superAdminLevel] = await connection.execute(`
      SELECT level_id FROM admin_level WHERE level_code = 'SUPER_ADMIN' AND is_active = 1
    `);

    if (superAdminLevel.length === 0) {
      console.log('❌ SUPER_ADMIN 권한 레벨이 존재하지 않습니다.');
      return;
    }

    const superAdminLevelId = superAdminLevel[0].level_id;
    console.log(`✅ SUPER_ADMIN 권한 레벨 ID: ${superAdminLevelId}`);

    // 3. 초기 관리자 계정을 SUPER_ADMIN으로 수정
    const initialAdminLoginId = process.env.INITIAL_ADMIN_LOGIN_ID;
    if (initialAdminLoginId) {
      console.log(`🔧 초기 관리자 계정 권한 수정 중: ${initialAdminLoginId}`);

      const [result] = await connection.execute(
        `
        UPDATE admin 
        SET admin_level_id = ? 
        WHERE login_id = ? AND is_active = 1
      `,
        [superAdminLevelId, initialAdminLoginId],
      );

      if (result.affectedRows > 0) {
        console.log(
          `✅ 초기 관리자 계정 권한이 SUPER_ADMIN으로 수정되었습니다: ${initialAdminLoginId}`,
        );
      } else {
        console.log(
          `⚠️ 초기 관리자 계정을 찾을 수 없습니다: ${initialAdminLoginId}`,
        );
      }
    }

    // 4. 수정 후 상태 확인
    console.log('\n🔍 수정 후 관리자 계정 상태:');
    const [updatedAdmins] = await connection.execute(`
      SELECT 
        a.admin_id,
        a.login_id,
        a.name,
        a.email,
        al.level_code,
        al.level_name,
        t.team_name
      FROM admin a
      LEFT JOIN admin_level al ON a.admin_level_id = al.level_id
      LEFT JOIN team t ON a.team_id = t.team_id
      WHERE a.is_active = 1
    `);

    updatedAdmins.forEach((admin) => {
      console.log(
        `- ${admin.login_id} (${admin.name}): ${admin.level_code} - ${admin.level_name} [팀: ${admin.team_name || '없음'}]`,
      );
    });

    console.log('\n✅ 관리자 권한 수정 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await connection.end();
  }
}

// 스크립트 실행
fixAdminPermissions();
