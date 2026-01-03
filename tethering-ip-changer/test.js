const { execSync, exec } = require('child_process');
const os = require('os');

/**
 * IP 주소를 변경하는 함수
 * Windows와 macOS 플랫폼 지원
 */
function changeIP() {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      // Windows에서 iPhone 관련 인터페이스 찾기
      console.log('Windows에서 iPhone 연결 인터페이스 찾는 중...');
      const interfaceList = execSync('netsh interface show interface').toString();
      const lines = interfaceList.split('\n');
      
      // iPhone 또는 이더넷 관련 인터페이스 찾기
      let targetInterface = null;
      for (const line of lines) {
        if (line.includes('iPhone') || line.includes('이더넷')) {
          // 연결된 인터페이스만 처리
          if (line.includes('Connected') || line.includes('연결됨')) {
            const parts = line.trim().split(/\s+/);
            // 마지막 부분이 인터페이스 이름
            targetInterface = parts.slice(3).join(' ');
            break;
          }
        }
      }

      if (targetInterface) {
        console.log(`인터페이스 "${targetInterface}" 재설정 중...`);
        try {
          // 비동기 방식으로 실행하여 메모리 문제 방지
          exec(`netsh interface set interface "${targetInterface}" disabled`, (error) => {
            if (error) {
              console.error(`인터페이스 비활성화 중 오류: ${error.message}`);
              return;
            }
            
            console.log(`인터페이스 "${targetInterface}" 비활성화 완료, 재활성화 중...`);
            setTimeout(() => {
              exec(`netsh interface set interface "${targetInterface}" enabled`, (error) => {
                if (error) {
                  console.error(`인터페이스 활성화 중 오류: ${error.message}`);
                  return;
                }
                console.log('IP 변경 완료');
              });
            }, 2000);
          });
        } catch (cmdError) {
          console.error('명령어 실행 중 오류:', cmdError.message);
        }
      } else {
        console.error('iPhone 또는 이더넷 관련 인터페이스를 찾을 수 없습니다.');
        console.log('사용 가능한 인터페이스 목록:');
        console.log(interfaceList);
      }
    } else if (platform === 'darwin') {
      // macOS에서 USB 테더링 연결 해제 및 재연결
      console.log('macOS에서 iPhone USB 테더링 IP 변경 중...');
      const networkServices = execSync('networksetup -listallnetworkservices').toString();
      const iPhoneService = networkServices.split('\n').find(service => service.includes('iPhone'));
      
      if (iPhoneService) {
        exec(`networksetup -setnetworkserviceenabled "${iPhoneService}" off`, (error) => {
          if (error) {
            console.error(`서비스 비활성화 중 오류: ${error.message}`);
            return;
          }
          
          setTimeout(() => {
            exec(`networksetup -setnetworkserviceenabled "${iPhoneService}" on`, (error) => {
              if (error) {
                console.error(`서비스 활성화 중 오류: ${error.message}`);
                return;
              }
              console.log('IP 변경 완료');
            });
          }, 2000);
        });
      } else {
        console.error('iPhone USB 테더링 서비스를 찾을 수 없습니다.');
      }
    } else {
      console.error('지원하지 않는 플랫폼입니다:', platform);
    }
  } catch (error) {
    console.error('IP 변경 중 오류 발생:', error.message);
  }
}

// 외부에서 사용할 수 있도록 내보내기
module.exports = { changeIP };

// 직접 실행할 경우 IP 변경 함수 호출
if (require.main === module) {
  changeIP();
} 