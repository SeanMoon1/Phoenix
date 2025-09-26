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

  // Gmail 인증 URL 생성
  const handleGetAuthUrl = async () => {
    try {
      const response = await gmailApi.getAuthUrl();
      if (response.success && response.data) {
        setAuthUrl(response.data.authUrl);
      }
    } catch (error) {
      console.error('❌ 인증 URL 생성 실패:', error);
    }
  };

  // Gmail 인증
  const handleAuthenticate = async () => {
    if (!authCode.trim()) return;

    try {
      setLoading(true);
      const response = await gmailApi.authenticate(authCode);
      if (response.success) {
        setAuthenticated(true);
        setAuthCode('');
        loadEmails();
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
      if (response.success && response.data) {
        // 각 이메일의 상세 정보 로드
        const emailDetails = await Promise.all(
          response.data.messages.map(async msg => {
            const detailResponse = await gmailApi.getEmailById(msg.id);
            return detailResponse.success ? detailResponse.data : null;
          })
        );

        setEmails(emailDetails.filter(Boolean));
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
      const response = await gmailApi.sendReply(
        selectedEmail.id,
        replyContent,
        adminName
      );

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
        {!authenticated && (
          <button
            onClick={handleGetAuthUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gmail 연결하기
          </button>
        )}
      </div>

      {/* Gmail 인증 */}
      {!authenticated && authUrl && (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
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
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '인증 중...' : '인증하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이메일 목록 */}
      {authenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 이메일 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                이메일 목록
              </h3>
              <button
                onClick={loadEmails}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {loading ? '로딩 중...' : '새로고침'}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {from}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {date}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  내용
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {extractTextContent(selectedEmail) || selectedEmail.snippet}
                </div>
              </div>

              {/* 답장 작성 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  답장 작성
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                    {replySuccess}
                  </div>
                )}

                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyContent.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
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
