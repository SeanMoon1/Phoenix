import React, { useState, useEffect } from 'react';
import { gmailApi } from '../../services/api';
import { Icon } from '../../utils/icons';

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
      size: number;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
        size: number;
      };
      headers?: Array<{ name: string; value: string }>;
    }>;
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
  labelIds: string[];
}

// interface EmailListResponse {
//   messages: Array<{ id: string; threadId: string }>;
//   nextPageToken?: string;
//   resultSizeEstimate: number;
// }

const EmailManager: React.FC = () => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  // const [emailList, setEmailList] = useState<EmailListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [adminName, setAdminName] = useState('Phoenix 관리자');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');
  const [gmailConfig, setGmailConfig] = useState<any>(null);

  // Gmail 설정 상태 확인
  const checkGmailConfig = async () => {
    try {
      console.log('🔍 Gmail 설정 상태 확인 요청');
      const response = await gmailApi.checkConfig();
      console.log('📥 Gmail 설정 상태 응답:', response);

      if (response.data) {
        setGmailConfig(response.data);
        console.log('✅ Gmail 설정 상태:', response.data.status);
      }
    } catch (error) {
      console.error('❌ Gmail 설정 상태 확인 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 Gmail 설정 상태 확인
  useEffect(() => {
    checkGmailConfig();
  }, []);

  // Gmail 인증 URL 생성
  const handleGetAuthUrl = async () => {
    console.log('🔍 Gmail 연결 버튼 클릭됨');
    try {
      console.log('📤 Gmail 인증 URL 요청 시작');
      const response = await gmailApi.getAuthUrl();
      console.log('📥 Gmail 인증 URL 응답 전체:', response);
      console.log('📥 Gmail 인증 URL 응답 데이터:', response.data);
      console.log('📥 Gmail 인증 URL 응답 성공 여부:', response.success);

      // 백엔드에서 직접 { authUrl: string } 형태로 반환하므로 response.data.authUrl로 접근
      if (response.data && response.data.authUrl) {
        console.log('✅ Gmail 인증 URL 생성 성공:', response.data.authUrl);
        setAuthUrl(response.data.authUrl);
      } else {
        console.error('❌ Gmail 인증 URL 응답 형식 오류:', response);
        console.error('❌ 응답 구조 분석:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : 'no data',
          authUrl: response.data?.authUrl,
        });
      }
    } catch (error) {
      console.error('❌ Gmail 인증 URL 생성 실패:', error);
    }
  };

  // Gmail 인증
  const handleAuthenticate = async () => {
    if (!authCode.trim()) return;

    try {
      setLoading(true);
      const response = await gmailApi.authenticate(authCode);
      console.log('📥 Gmail 인증 응답:', response);

      // 백엔드에서 { success: boolean; message: string } 형태로 반환
      if (response.success) {
        console.log('✅ Gmail 인증 성공:', response.message);
        setAuthenticated(true);
        setAuthCode('');
        loadEmails();
      } else {
        console.error('❌ Gmail 인증 실패:', response.message);
      }
    } catch (error) {
      console.error('❌ Gmail 인증 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 목록 로드
  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await gmailApi.getEmails(20);
      console.log('📥 이메일 목록 응답:', response);

      // 백엔드에서 EmailListResponse 타입을 직접 반환하므로 response.data.messages로 접근
      if (response.data && response.data.messages) {
        console.log(
          '✅ 이메일 목록 로드 성공, 메시지 수:',
          response.data.messages.length
        );

        // 각 이메일의 상세 정보 로드
        const emailDetails = await Promise.all(
          response.data.messages.map(
            async (msg: { id: string; threadId: string }) => {
              const detailResponse = await gmailApi.getEmailById(msg.id);
              // 백엔드에서 GmailMessage 타입을 직접 반환하므로 detailResponse.data가 곧 데이터
              return detailResponse.data ? detailResponse.data : null;
            }
          )
        );

        setEmails(emailDetails.filter(Boolean) as EmailMessage[]);
      } else {
        console.error('❌ 이메일 목록 응답 형식 오류:', response);
      }
    } catch (error) {
      console.error('❌ 이메일 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 헤더에서 값 추출
  const getHeaderValue = (
    headers: Array<{ name: string; value: string }>,
    name: string
  ): string => {
    const header = headers.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : '';
  };

  // 이메일 본문 디코딩
  const decodeEmailBody = (body: { data?: string; size: number }): string => {
    if (!body.data) return '';

    try {
      // 브라우저에서 Base64 디코딩
      const decoded = atob(body.data);
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      console.error('❌ 이메일 본문 디코딩 실패:', error);
      return '';
    }
  };

  // HTML 이메일 본문 추출 (사용하지 않으므로 주석 처리)
  // const extractHtmlContent = (message: EmailMessage): string => {
  //   if (message.payload.body.data) {
  //     return decodeEmailBody(message.payload.body);
  //   }

  //   if (message.payload.parts) {
  //     for (const part of message.payload.parts) {
  //       if (part.mimeType === 'text/html' && part.body.data) {
  //         return decodeEmailBody(part.body);
  //       }

  //       // 중첩된 parts 처리
  //       if (part.mimeType === 'multipart/alternative' && part.parts) {
  //         for (const subPart of part.parts) {
  //           if (subPart.mimeType === 'text/html' && subPart.body.data) {
  //             return decodeEmailBody(subPart.body);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   return '';
  // };

  // 텍스트 이메일 본문 추출
  const extractTextContent = (message: EmailMessage): string => {
    if (message.payload.body.data) {
      return decodeEmailBody(message.payload.body);
    }

    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          return decodeEmailBody(part.body);
        }

        // 중첩된 parts 처리 (타입 안전성을 위해 주석 처리)
        // if (part.mimeType === 'multipart/alternative' && part.parts) {
        //   for (const subPart of part.parts) {
        //     if (subPart.mimeType === 'text/plain' && subPart.body.data) {
        //       return decodeEmailBody(subPart.body);
        //     }
        //   }
        // }
      }
    }

    return '';
  };

  // 답장 전송
  const handleSendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;

    try {
      setSendingReply(true);
      const response = await gmailApi.sendReply({
        messageId: selectedEmail.id,
        threadId: selectedEmail.threadId,
        to: getHeaderValue(selectedEmail.payload.headers, 'From'),
        subject: `Re: ${getHeaderValue(
          selectedEmail.payload.headers,
          'Subject'
        )}`,
        content: replyContent,
      });

      if (response.success) {
        setReplySuccess('답장이 성공적으로 전송되었습니다.');
        setReplyContent('');
        setTimeout(() => setReplySuccess(''), 3000);
      }
    } catch (error) {
      console.error('❌ 답장 전송 실패:', error);
    } finally {
      setSendingReply(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleString('ko-KR');
  };

  // 이메일이 문의사항인지 확인
  const isInquiryEmail = (email: EmailMessage): boolean => {
    const subject = getHeaderValue(email.payload.headers, 'Subject');
    const from = getHeaderValue(email.payload.headers, 'From');

    return (
      subject.includes('[문의]') ||
      subject.includes('문의') ||
      from.includes('phoenix') ||
      from.includes('@')
    );
  };

  useEffect(() => {
    if (authenticated) {
      loadEmails();
    }
  }, [authenticated]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📧 이메일 관리
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gmail을 통해 문의사항을 확인하고 답장할 수 있습니다.
          </p>
        </div>
        {/* Gmail 설정 상태 표시 */}
        {gmailConfig && (
          <div className="p-4 mb-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Gmail 설정 상태
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  상태:
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    gmailConfig.status === 'healthy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                  }`}
                >
                  {gmailConfig.status === 'healthy' ? '정상' : '설정 필요'}
                </span>
              </div>
              {gmailConfig.config && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Client ID: {gmailConfig.config.hasClientId ? '✅' : '❌'}
                  </div>
                  <div>
                    Client Secret:{' '}
                    {gmailConfig.config.hasClientSecret ? '✅' : '❌'}
                  </div>
                  <div>
                    Redirect URI:{' '}
                    {gmailConfig.config.hasRedirectUris ? '✅' : '❌'}
                  </div>
                  <div>
                    Scopes: {gmailConfig.config.hasScopes ? '✅' : '❌'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!authenticated && (
          <button
            onClick={() => {
              console.log('🔍 Gmail 연결 버튼 클릭 이벤트 발생');
              handleGetAuthUrl();
            }}
            disabled={gmailConfig?.status !== 'healthy'}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {gmailConfig?.status === 'healthy'
              ? 'Gmail 연결하기'
              : 'Gmail 설정 필요'}
          </button>
        )}
      </div>

      {/* Gmail 인증 */}
      {!authenticated && authUrl && (
        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Gmail 인증
          </h3>
          <div className="space-y-4">
            <p className="text-blue-800 dark:text-blue-200">
              아래 버튼을 클릭하여 Gmail 인증을 진행하세요.
            </p>
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Gmail 인증 페이지로 이동
            </a>
            <div className="flex space-x-2">
              <input
                type="text"
                value={authCode}
                onChange={e => setAuthCode(e.target.value)}
                placeholder="인증 코드를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAuthenticate}
                disabled={loading || !authCode.trim()}
                className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '인증 중...' : '인증하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이메일 목록 */}
      {authenticated && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 이메일 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                이메일 목록
              </h3>
              <button
                onClick={loadEmails}
                disabled={loading}
                className="px-3 py-1 text-sm text-gray-700 transition-colors bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {loading ? '로딩 중...' : '새로고침'}
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-96">
              {emails.filter(isInquiryEmail).map(email => {
                const from = getHeaderValue(email.payload.headers, 'From');
                const subject = getHeaderValue(
                  email.payload.headers,
                  'Subject'
                );
                const date = formatDate(email.internalDate);

                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {from}
                        </p>
                        <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                          {subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {date}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Icon
                          type="mail"
                          category="ui"
                          className="text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 이메일 상세 및 답장 */}
          {selectedEmail && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  이메일 상세
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      보낸 사람:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {getHeaderValue(selectedEmail.payload.headers, 'From')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      제목:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {getHeaderValue(selectedEmail.payload.headers, 'Subject')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      날짜:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatDate(selectedEmail.internalDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 이메일 본문 */}
              <div className="p-4 bg-white border rounded-lg dark:bg-gray-700">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  내용
                </h4>
                <div className="overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300 max-h-40">
                  {extractTextContent(selectedEmail) || selectedEmail.snippet}
                </div>
              </div>

              {/* 답장 작성 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  답장 작성
                </h4>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    관리자 이름
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="관리자 이름"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    답장 내용
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="답장 내용을 입력하세요..."
                  />
                </div>

                {replySuccess && (
                  <div className="p-3 text-green-800 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-200">
                    {replySuccess}
                  </div>
                )}

                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyContent.trim()}
                  className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {sendingReply ? '전송 중...' : '답장 전송'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailManager;
