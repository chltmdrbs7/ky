// ================================================
// KY 중소기업지원센터 - 통합 Workers API
// 작성일: 2024-12-24
// 기능: Airtable + Resend + Telegram 통합 + 관리자 API
// 배포: Cloudflare Workers
// URL: https://ky-form.chltmdrbs7.workers.dev/
//
// ⚠️ Cloudflare 환경변수 설정 필요:
//   - AIRTABLE_TOKEN: Airtable Personal Access Token
//   - AIRTABLE_BASE_ID: Airtable Base ID
//   - AIRTABLE_TABLE_NAME: consulting (상담신청 테이블)
//   - RESEND_API_KEY: Resend API Key
//   - TELEGRAM_BOT_TOKEN: Telegram Bot Token
//   - TELEGRAM_CHAT_ID: Telegram Chat ID
//   - ADMIN_PASSWORD: 관리자 비밀번호
// ================================================

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ================================================
      // 관리자 인증 API (POST /auth)
      // ================================================
      if (path === '/auth') {
        return await handleAuthAPI(request, env, corsHeaders);
      }

      // ================================================
      // 접수내역 API (/leads)
      // ================================================
      if (path === '/leads' || path.startsWith('/leads/')) {
        return await handleLeadsAPI(request, env, corsHeaders, path);
      }

      // ================================================
      // 게시판 API (/board)
      // ================================================
      if (path === '/board' || path.startsWith('/board/')) {
        return await handleBoardAPI(request, env, corsHeaders, path);
      }

      // ================================================
      // 기존 게시글 API (GET /posts) - 공개용
      // ================================================
      if (path === '/posts' || path === '/api/posts') {
        if (request.method !== 'GET') {
          return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
        }

        try {
          // 게시여부가 true인 게시글만 조회
          const filterFormula = encodeURIComponent("{게시여부}=TRUE()");
          const sortField = encodeURIComponent("작성일");

          const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/board?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc`;
          const response = await fetch(airtableUrl, {
            headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` },
          });
          const data = await response.json();
          const posts = data.records.map(record => ({
            id: record.id,
            title: record.fields['제목'] || '',
            content: record.fields['내용'] || '',
            summary: record.fields['요약'] || '',
            category: record.fields['카테고리'] || '',
            thumbnail: record.fields['썸네일URL'] || '',
            tags: record.fields['태그'] || '',
            date: record.fields['작성일'] || '',
            views: record.fields['조회수'] || 0,
          }));
          return new Response(JSON.stringify({ posts }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      // 개별 게시글 조회 (GET /posts/:id)
      if (path.startsWith('/posts/')) {
        try {
          const recordId = path.replace('/posts/', '');
          const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/board/${recordId}`;
          const response = await fetch(airtableUrl, {
            headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` },
          });
          const record = await response.json();
          const post = {
            id: record.id,
            title: record.fields['제목'] || '',
            content: record.fields['내용'] || '',
            summary: record.fields['요약'] || '',
            category: record.fields['카테고리'] || '',
            thumbnail: record.fields['썸네일URL'] || '',
            tags: record.fields['태그'] || '',
            date: record.fields['작성일'] || '',
            views: record.fields['조회수'] || 0,
          };
          return new Response(JSON.stringify({ post }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      // ================================================
      // 문의 접수 API (POST /submit, /)
      // ================================================
      if (request.method === 'POST' && (path === '/' || path === '/submit')) {
        try {
          const rawBody = await request.text();
          const data = JSON.parse(rawBody);
          console.log('📥 KY 문의 접수');

          const results = {
            success: true,
            airtable: { success: false, id: null, error: null },
            email: { customer: { success: false, error: null }, staff: { success: false, error: null } },
            telegram: { success: false, error: null }
          };

          // 현재 시간 (KST)
          const now = new Date();
          const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
          const submitDate = kstTime.toISOString().split('T')[0];
          const submitTime = kstTime.toISOString().split('T')[1].substring(0, 5);

          // 안전한 값 추출
          const company = String(data.company || '-');
          const bizno = String(data.bizno || '-');
          const name = String(data.name || '-');
          const phone = String(data.phone || '-');
          const email = String(data.email || '');
          const industry = String(data.industry || '-');
          const founded = String(data.founded || '-');
          const consultTime = String(data.consultTime || '-');
          const amount = String(data.amount || '-');
          const fundType = String(data.fundType || '-');
          const message = String(data.message || '-');

          // ================================================
          // 1. Airtable 저장
          // ================================================
          try {
            console.log('📤 Airtable 저장 중...');

            const airtableFields = {
              'company': company,
              'bizno': bizno,
              'name': name,
              'phone': phone,
              'email': email,
              'industry': industry,
              'founded': founded,
              'consultTime': consultTime,
              'amount': amount,
              'fundType': fundType,
              'message': message,
              'submitDate': submitDate,
              'submitTime': submitTime,
              'status': '신규'
            };

            const airtableResponse = await fetch(
              `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME || 'consulting')}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields: airtableFields })
              }
            );

            if (airtableResponse.ok) {
              const airtableResult = await airtableResponse.json();
              results.airtable.success = true;
              results.airtable.id = airtableResult.id;
              console.log('✅ Airtable 저장 완료:', airtableResult.id);
            } else {
              const error = await airtableResponse.json();
              results.airtable.error = error;
              console.error('❌ Airtable 에러:', error);
            }
          } catch (error) {
            results.airtable.error = error.message;
            console.error('❌ Airtable 예외:', error.message);
          }

          // ================================================
          // 2. 고객 이메일 발송 (Resend)
          // ================================================
          if (email && env.RESEND_API_KEY) {
            try {
              console.log('📧 고객 이메일 발송 중...');

              const customerHtml = buildCustomerEmailHtml({
                name, company, phone, consultTime, amount, fundType, submitDate, submitTime
              });

              const customerEmailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'KY 중소기업지원센터 <noreply@mail.policy-fund.online>',
                  to: [email],
                  subject: '[KY 중소기업지원센터] 무료 상담 신청이 접수되었습니다',
                  html: customerHtml
                })
              });

              if (customerEmailResponse.ok) {
                const result = await customerEmailResponse.json();
                results.email.customer.success = true;
                console.log('✅ 고객 이메일 발송 완료:', result.id);
              } else {
                const error = await customerEmailResponse.json();
                results.email.customer.error = error;
                console.error('❌ 고객 이메일 에러:', error);
              }
            } catch (error) {
              results.email.customer.error = error.message;
              console.error('❌ 고객 이메일 예외:', error.message);
            }
          } else {
            results.email.customer.success = true;
            results.email.customer.error = 'Skipped (no email)';
          }

          // ================================================
          // 3. 내부 이메일 발송 (담당자용)
          // ================================================
          if (env.RESEND_API_KEY) {
            try {
              console.log('📧 내부 이메일 발송 중...');

              const staffHtml = buildStaffEmailHtml({
                company, bizno, name, phone, email,
                industry, founded, consultTime, amount, fundType, message,
                submitDate, submitTime
              });

              const staffEmailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'KY 중소기업지원센터 <noreply@mail.policy-fund.online>',
                  to: env.STAFF_EMAIL || 'jmfood12@naver.com',
                  bcc: 'mkt@polarad.co.kr',
                  subject: '[KY] ' + company + ' - ' + name,
                  html: staffHtml
                })
              });

              if (staffEmailResponse.ok) {
                const result = await staffEmailResponse.json();
                results.email.staff.success = true;
                console.log('✅ 내부 이메일 발송 완료:', result.id);
              } else {
                const error = await staffEmailResponse.json();
                results.email.staff.error = error;
                console.error('❌ 내부 이메일 에러:', error);
              }
            } catch (error) {
              results.email.staff.error = error.message;
              console.error('❌ 내부 이메일 예외:', error.message);
            }
          }

          // ================================================
          // 4. Telegram 메시지 발송
          // ================================================
          if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            try {
              console.log('📱 Telegram 발송 중...');

              const telegramText = buildTelegramMessage({
                company, bizno, name, phone, email,
                industry, founded, consultTime, amount, fundType, message,
                submitDate, submitTime
              });

              const telegramResponse = await fetch(
                `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: env.TELEGRAM_CHAT_ID,
                    text: telegramText,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                  })
                }
              );

              if (telegramResponse.ok) {
                const result = await telegramResponse.json();
                results.telegram.success = true;
                console.log('✅ Telegram 발송 완료:', result.result.message_id);
              } else {
                const error = await telegramResponse.json();
                results.telegram.error = error;
                console.error('❌ Telegram 에러:', error);
              }
            } catch (error) {
              results.telegram.error = error.message;
              console.error('❌ Telegram 예외:', error.message);
            }
          }

          console.log('📊 최종 결과:', results);
          return new Response(JSON.stringify(results), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } catch (error) {
          console.error('💥 치명적 에러:', error.message);
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // ================================================
      // 기본 응답
      // ================================================
      return new Response(JSON.stringify({
        message: 'KY API',
        endpoints: [
          'POST / - 문의 접수',
          'POST /submit - 문의 접수',
          'POST /auth - 관리자 로그인',
          'GET /leads - 접수 내역 조회',
          'PATCH /leads/:id - 접수 상태/메모 수정',
          'GET /posts - 게시글 목록 (공개)',
          'GET /posts/:id - 게시글 상세',
          'GET /board/all - 전체 게시글 조회 (관리자용)',
          'POST /board - 게시글 생성',
          'PATCH /board/:id - 게시글 수정',
          'DELETE /board/:id - 게시글 삭제'
        ]
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

// ================================================
// 관리자 인증 API 핸들러
// ================================================
async function handleAuthAPI(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password } = await request.json();

    // 환경변수에서 비밀번호 확인
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin password not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password === adminPassword) {
      // 간단한 토큰 생성 (24시간 유효)
      const token = btoa(`ky_admin_${Date.now()}_${Math.random().toString(36).substr(2)}`);

      return new Response(JSON.stringify({
        success: true,
        token: token,
        expiresIn: 86400000 // 24시간 (밀리초)
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid password'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ================================================
// 접수내역 API 핸들러
// ================================================
async function handleLeadsAPI(request, env, corsHeaders, path) {
  const method = request.method;
  const tableName = env.AIRTABLE_TABLE_NAME || 'consulting';

  // GET /leads - 접수 내역 전체 조회
  if (method === 'GET' && path === '/leads') {
    try {
      console.log('📋 Fetching leads...');

      const sortField = encodeURIComponent("submitDate");
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?sort[0][field]=${sortField}&sort[0][direction]=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch leads'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const leads = result.records.map(record => ({
        id: record.id,
        createdTime: record.createdTime,
        company: record.fields['company'],
        bizno: record.fields['bizno'],
        name: record.fields['name'],
        phone: record.fields['phone'],
        email: record.fields['email'],
        industry: record.fields['industry'],
        founded: record.fields['founded'],
        consultTime: record.fields['consultTime'],
        amount: record.fields['amount'],
        fundType: record.fields['fundType'],
        message: record.fields['message'],
        submitDate: record.fields['submitDate'],
        submitTime: record.fields['submitTime'],
        status: record.fields['status'] || '신규',
        memo: record.fields['memo'] || ''
      }));

      console.log(`✅ Fetched ${leads.length} leads`);

      return new Response(JSON.stringify({
        success: true,
        leads: leads
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Leads GET error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // PATCH /leads/:id - 접수 상태/메모 수정
  if (method === 'PATCH' && path.startsWith('/leads/')) {
    const recordId = path.replace('/leads/', '');

    if (!recordId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Record ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const data = await request.json();
      console.log('📝 Updating lead:', recordId);

      const fields = {};

      // 전달된 필드만 업데이트
      if (data.status !== undefined) fields['status'] = data.status;
      if (data.memo !== undefined) fields['memo'] = data.memo;

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable update error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to update lead'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Lead updated:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        lead: {
          id: result.id,
          ...result.fields
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Lead PATCH error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 지원하지 않는 메서드
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed or path not found'
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ================================================
// 게시판 API 핸들러
// ================================================
async function handleBoardAPI(request, env, corsHeaders, path) {
  const method = request.method;
  const BOARD_TABLE = 'board';

  // GET /board - 게시글 목록 조회 (공개된 것만)
  if (method === 'GET' && path === '/board') {
    try {
      console.log('📋 Fetching board posts...');

      // 게시여부가 true인 게시글만 조회, 작성일 내림차순 정렬
      const filterFormula = encodeURIComponent("{게시여부}=TRUE()");
      const sortField = encodeURIComponent("작성일");

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch posts'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const posts = result.records.map(record => ({
        id: record.id,
        제목: record.fields['제목'],
        내용: record.fields['내용'],
        요약: record.fields['요약'],
        썸네일URL: record.fields['썸네일URL'],
        태그: record.fields['태그'],
        카테고리: record.fields['카테고리'],
        작성일: record.fields['작성일'],
        조회수: record.fields['조회수'] || 0,
        게시여부: record.fields['게시여부']
      }));

      console.log(`✅ Fetched ${posts.length} posts`);

      return new Response(JSON.stringify({
        success: true,
        posts: posts
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board GET error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // GET /board/all - 모든 게시글 조회 (관리자용, 비공개 포함)
  if (method === 'GET' && path === '/board/all') {
    try {
      console.log('📋 Fetching all board posts (admin)...');

      const sortField = encodeURIComponent("작성일");

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}?sort[0][field]=${sortField}&sort[0][direction]=desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch posts'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const posts = result.records.map(record => ({
        id: record.id,
        제목: record.fields['제목'],
        내용: record.fields['내용'],
        요약: record.fields['요약'],
        썸네일URL: record.fields['썸네일URL'],
        태그: record.fields['태그'],
        카테고리: record.fields['카테고리'],
        작성일: record.fields['작성일'],
        조회수: record.fields['조회수'] || 0,
        게시여부: record.fields['게시여부']
      }));

      return new Response(JSON.stringify({
        success: true,
        posts: posts
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // POST /board - 게시글 생성
  if (method === 'POST' && path === '/board') {
    try {
      const data = await request.json();
      console.log('📝 Creating board post...');

      const fields = {
        '제목': data.제목 || data.title,
        '내용': data.내용 || data.content,
        '요약': data.요약 || data.summary || '',
        '썸네일URL': data.썸네일URL || data.thumbnail || '',
        '태그': data.태그 || data.tags || '',
        '카테고리': data.카테고리 || data.category || '공지',
        '작성일': data.작성일 || data.date || new Date().toISOString().split('T')[0],
        '조회수': data.조회수 || data.views || 0,
        '게시여부': data.게시여부 !== undefined ? data.게시여부 : (data.published !== undefined ? data.published : true)
      };

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable create error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to create post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post created:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        post: {
          id: result.id,
          ...result.fields
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board POST error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // PATCH /board/:id - 게시글 수정
  if (method === 'PATCH' && path.startsWith('/board/') && path !== '/board/all') {
    const recordId = path.replace('/board/', '');

    if (!recordId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Record ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const data = await request.json();
      console.log('📝 Updating board post:', recordId);

      const fields = {};

      // 전달된 필드만 업데이트
      if (data.제목 !== undefined || data.title !== undefined) fields['제목'] = data.제목 || data.title;
      if (data.내용 !== undefined || data.content !== undefined) fields['내용'] = data.내용 || data.content;
      if (data.요약 !== undefined || data.summary !== undefined) fields['요약'] = data.요약 || data.summary;
      if (data.썸네일URL !== undefined || data.thumbnail !== undefined) fields['썸네일URL'] = data.썸네일URL || data.thumbnail;
      if (data.태그 !== undefined || data.tags !== undefined) fields['태그'] = data.태그 || data.tags;
      if (data.카테고리 !== undefined || data.category !== undefined) fields['카테고리'] = data.카테고리 || data.category;
      if (data.작성일 !== undefined || data.date !== undefined) fields['작성일'] = data.작성일 || data.date;
      if (data.조회수 !== undefined || data.views !== undefined) fields['조회수'] = data.조회수 || data.views;
      if (data.게시여부 !== undefined) fields['게시여부'] = data.게시여부;
      if (data.published !== undefined) fields['게시여부'] = data.published;

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable update error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to update post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post updated:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        post: {
          id: result.id,
          ...result.fields
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board PATCH error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE /board/:id - 게시글 삭제
  if (method === 'DELETE' && path.startsWith('/board/')) {
    const recordId = path.replace('/board/', '');

    if (!recordId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Record ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      console.log('🗑️ Deleting board post:', recordId);

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${BOARD_TABLE}/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        console.error('❌ Airtable delete error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to delete post'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      console.log('✅ Post deleted:', result.id);

      return new Response(JSON.stringify({
        success: true,
        id: result.id,
        deleted: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Board DELETE error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 지원하지 않는 메서드
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed or path not found'
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ================================================
// 고객 이메일 HTML 생성
// ================================================
function buildCustomerEmailHtml(d) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1E3A5F 0%,#3B82F6 100%);padding:32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">KY 중소기업지원센터</h1>
<p style="margin:12px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">무료 상담 신청이 접수되었습니다</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:32px;">
<p style="margin:0 0 20px;font-size:16px;color:#1e293b;"><strong>${escapeHtml(d.name)}</strong>님, 안녕하세요.</p>
<p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
KY 중소기업지원센터에 상담 신청해 주셔서 감사합니다.<br>
접수하신 내용을 확인 후, <strong style="color:#3B82F6;">1영업일 이내</strong>에 담당 컨설턴트가 연락드리겠습니다.
</p>

<!-- Info Box -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;border-radius:8px;border-left:4px solid #3B82F6;">
<tr><td style="padding:20px;">
<p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1E3A5F;">📋 접수 내용</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px;">기업명</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.company)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">대표자명</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.name)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">연락처</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.phone)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">통화 가능 시간</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.consultTime)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">필요 자금 규모</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.amount)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">자금 종류</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${escapeHtml(d.fundType)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">접수일시</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${d.submitDate} ${d.submitTime}</td></tr>
</table>
</td></tr>
</table>

<p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
※ 추가 문의사항이 있으시면 대표전화 <strong>1555-0238</strong>로 연락 주세요.
</p>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#1E3A5F;padding:24px;text-align:center;">
<p style="margin:0;color:#ffffff;font-size:14px;font-weight:500;">KY 중소기업지원센터</p>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">전북특별자치도 익산시 평동로3길 32 | 대표전화: 1555-0238</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ================================================
// 내부 이메일 HTML 생성 (반응형 디자인)
// ================================================
function buildStaffEmailHtml(d) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; }
  .content-padding { padding: 16px !important; }
  .info-label { width: 90px !important; font-size: 12px !important; }
  .info-value { font-size: 13px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:12px;">
<tr><td align="center">
<table class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background-color:#dc2626;padding:14px 16px;">
<h2 style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">🔔 KY 신규 상담</h2>
</td>
</tr>

<!-- Alert Box -->
<tr>
<td class="content-padding" style="padding:16px 16px 0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:2px solid #fecaca;border-radius:6px;">
<tr><td style="padding:10px 12px;">
<p style="margin:0;font-size:14px;color:#991b1b;"><strong>⏰ 통화가능:</strong> ${escapeHtml(d.consultTime)}</p>
</td></tr>
</table>
</td>
</tr>

<!-- Customer Info -->
<tr>
<td class="content-padding" style="padding:16px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;">👤 고객정보</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;table-layout:fixed;">
<tr style="background-color:#f9fafb;"><td class="info-label" style="padding:8px 10px;width:100px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">기업명</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.company)}</td></tr>
<tr><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">사업자번호</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.bizno)}</td></tr>
<tr style="background-color:#f9fafb;"><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">대표자명</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.name)}</td></tr>
<tr><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">연락처</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.phone)}</td></tr>
<tr style="background-color:#f9fafb;"><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">이메일</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.email)}</td></tr>
<tr><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">업종</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.industry)}</td></tr>
<tr style="background-color:#f9fafb;"><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;">설립연도</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#374151;word-break:break-all;">${escapeHtml(d.founded)}</td></tr>
</table>
</td>
</tr>

<!-- Fund Info -->
<tr>
<td class="content-padding" style="padding:0 16px 16px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;">💰 자금정보</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;table-layout:fixed;">
<tr style="background-color:#f9fafb;"><td class="info-label" style="padding:8px 10px;width:100px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">필요자금</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;word-break:break-all;">${escapeHtml(d.amount)}</td></tr>
<tr><td class="info-label" style="padding:8px 10px;font-size:12px;color:#6b7280;background-color:#f9fafb;">자금종류</td><td class="info-value" style="padding:8px 10px;font-size:13px;color:#374151;word-break:break-all;">${escapeHtml(d.fundType)}</td></tr>
</table>
</td>
</tr>

<!-- Message -->
<tr>
<td class="content-padding" style="padding:0 16px 16px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;">💬 문의사항</p>
<div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;">
<p style="margin:0;font-size:13px;color:#374151;line-height:1.5;white-space:pre-wrap;word-break:break-all;">${escapeHtml(d.message)}</p>
</div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#f3f4f6;padding:12px 16px;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
📅 ${d.submitDate} ${d.submitTime} | KY 중소기업지원센터
</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ================================================
// Telegram 메시지 생성
// ================================================
function buildTelegramMessage(d) {
  let msg = '🔔 <b>KY 신규 상담</b>\n\n';
  msg += '👤 <b>고객정보</b>\n';
  msg += '├ 기업명: <b>' + escapeHtml(d.company) + '</b>\n';
  msg += '├ 사업자번호: ' + escapeHtml(d.bizno) + '\n';
  msg += '├ 대표자명: <b>' + escapeHtml(d.name) + '</b>\n';
  msg += '├ 연락처: <code>' + escapeHtml(d.phone) + '</code>\n';
  msg += '├ 이메일: ' + escapeHtml(d.email) + '\n';
  msg += '├ 업종: ' + escapeHtml(d.industry) + '\n';
  msg += '└ 설립연도: ' + escapeHtml(d.founded) + '\n\n';
  msg += '💰 <b>자금정보</b>\n';
  msg += '├ 통화가능: <b>' + escapeHtml(d.consultTime) + '</b>\n';
  msg += '├ 규모: ' + escapeHtml(d.amount) + '\n';
  msg += '└ 종류: ' + escapeHtml(d.fundType) + '\n';
  if (d.message && d.message !== '-') {
    msg += '\n💬 <b>문의</b>\n' + escapeHtml(d.message) + '\n';
  }
  msg += '\n📅 ' + d.submitDate + ' ' + d.submitTime;
  msg += '\n\n📊 <a href="https://airtable.com/appVtpUDzH23zDUdu/shrVORVT7BCdZqfQ4">Airtable에서 보기</a>';
  msg += '\n👆 클릭하면 전체 접수 내역을 확인할 수 있습니다';
  return msg;
}

// ================================================
// HTML 이스케이프 함수
// ================================================
function escapeHtml(str) {
  if (!str) return '-';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
