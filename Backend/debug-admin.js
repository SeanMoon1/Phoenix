// 관리자 계정 디버깅 스크립트
const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugAdmin() {
  console.log('🔍 관리자 계정 디버깅 시작...\n');

  // 환경변수 확인
  console.log('📋 환경변수 확인:');
  console.log(
    'INITIAL_ADMIN_LOGIN_ID:',
    process.env.INITIAL_ADMIN_LOGIN_ID || '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_PASSWORD:',
    process.env.INITIAL_ADMIN_PASSWORD ? '✅ 설정됨' : '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_NAME:',
    process.env.INITIAL_ADMIN_NAME || '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_EMAIL:',
    process.env.INITIAL_ADMIN_EMAIL || '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_PHONE:',
    process.env.INITIAL_ADMIN_PHONE || '❌ 미설정',
  );
  console.log('');

  // 데이터베이스 연결
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'phoenix',
  });

  try {
    // 1. admin_level 테이블 확인
    console.log('📊 admin_level 테이블 확인:');
    const [adminLevels] = await connection.execute('SELECT * FROM admin_level');
    console.log(`총 ${adminLevels.length}개의 권한 레벨이 있습니다:`);
    adminLevels.forEach((level) => {
      console.log(
        `  - ${level.level_name} (${level.level_code}): ${level.description}`,
      );
    });
    console.log('');

    // 2. team 테이블 확인
    console.log('📊 team 테이블 확인:');
    const [teams] = await connection.execute('SELECT * FROM team');
    console.log(`총 ${teams.length}개의 팀이 있습니다:`);
    teams.forEach((team) => {
      console.log(
        `  - ${team.team_name} (${team.team_code}): ${team.description}`,
      );
    });
    console.log('');

    // 3. admin 테이블 확인
    console.log('📊 admin 테이블 확인:');
    const [admins] = await connection.execute('SELECT * FROM admin');
    console.log(`총 ${admins.length}개의 관리자가 있습니다:`);
    admins.forEach((admin) => {
      console.log(`  - ${admin.name} (${admin.login_id}): ${admin.email}`);
      console.log(
        `    팀 ID: ${admin.team_id}, 권한 레벨 ID: ${admin.admin_level_id}`,
      );
      console.log(
        `    활성화: ${admin.is_active ? '✅' : '❌'}, 사용여부: ${admin.use_yn}`,
      );
    });
    console.log('');

    // 4. 특정 관리자 계정 확인
    if (process.env.INITIAL_ADMIN_LOGIN_ID) {
      console.log(
        `🔍 관리자 계정 상세 확인: ${process.env.INITIAL_ADMIN_LOGIN_ID}`,
      );
      const [adminDetails] = await connection.execute(
        'SELECT a.*, al.level_name, al.level_code, t.team_name FROM admin a LEFT JOIN admin_level al ON a.admin_level_id = al.level_id LEFT JOIN team t ON a.team_id = t.team_id WHERE a.login_id = ?',
        [process.env.INITIAL_ADMIN_LOGIN_ID],
      );

      if (adminDetails.length > 0) {
        const admin = adminDetails[0];
        console.log('✅ 관리자 계정 발견:');
        console.log(`  이름: ${admin.name}`);
        console.log(`  이메일: ${admin.email}`);
        console.log(`  팀: ${admin.team_name}`);
        console.log(`  권한: ${admin.level_name} (${admin.level_code})`);
        console.log(`  활성화: ${admin.is_active ? '✅' : '❌'}`);
        console.log(`  사용여부: ${admin.use_yn}`);
        console.log(`  생성일: ${admin.created_at}`);
      } else {
        console.log('❌ 관리자 계정을 찾을 수 없습니다.');
      }
    }
  } catch (error) {
    console.error('❌ 데이터베이스 오류:', error.message);
  } finally {
    await connection.end();
  }
}

debugAdmin().catch(console.error);
