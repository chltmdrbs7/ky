// ================================================
// KY 중소기업지원센터 접수내역 관리
// ================================================

// 전역 변수
let allLeads = [];
let filteredLeads = [];
let currentPage = 1;
const pageSize = 20;
let selectedLeads = [];
let currentLeadDetail = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  loadSidebar('leads');
  loadDashboardHeader('접수내역', '고객 상담 접수를 관리하세요');
  loadLeads();

  // 필터 변경 이벤트
  document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
  document.getElementById('dateFilter')?.addEventListener('change', applyFilters);

  // 검색 엔터키
  document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchLeads();
  });
});

// 접수 내역 로드
async function loadLeads() {
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="13" style="text-align: center; padding: 40px; color: var(--neutral-400);">
        데이터를 불러오는 중...
      </td>
    </tr>
  `;

  try {
    const response = await fetch(`${WORKER_URL}/leads`);
    if (!response.ok) throw new Error('API error');

    const result = await response.json();
    allLeads = result.leads || [];

    // 최신순 정렬
    allLeads.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    applyFilters();
  } catch (error) {
    console.error('Leads load error:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="13" style="text-align: center; padding: 40px; color: var(--error);">
          데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </td>
      </tr>
    `;
  }
}

// 필터 적용
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const dateFilter = document.getElementById('dateFilter')?.value || 'all';
  const searchQuery = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

  filteredLeads = allLeads.filter(lead => {
    // 상태 필터
    if (statusFilter) {
      const status = getStatusKey(lead.상태 || '대기중');
      if (status !== statusFilter) return false;
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const leadDate = new Date(lead.createdTime);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (leadDate < cutoff) return false;
    }

    // 검색 필터
    if (searchQuery) {
      const searchFields = [
        lead.대표자명,
        lead.연락처,
        lead.기업명,
        lead.이메일
      ].filter(Boolean).map(f => f.toLowerCase());

      if (!searchFields.some(f => f.includes(searchQuery))) return false;
    }

    return true;
  });

  currentPage = 1;
  renderLeads();
  updatePagination();
  document.getElementById('totalCount').textContent = filteredLeads.length;
}

// 검색
function searchLeads() {
  applyFilters();
}

// 상태 키 변환
function getStatusKey(status) {
  const mapping = {
    '신규': 'pending',
    '대기': 'pending',
    '대기중': 'pending',
    '상담중': 'progress',
    '진행중': 'progress',
    '완료': 'complete',
    '취소': 'cancel'
  };
  return mapping[status] || 'pending';
}

// 접수 목록 렌더링
function renderLeads() {
  const tbody = document.getElementById('leadsTableBody');
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageLeads = filteredLeads.slice(start, end);

  if (pageLeads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" style="text-align: center; padding: 40px; color: var(--neutral-400);">
          접수 내역이 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pageLeads.map(lead => {
    const statusClass = getStatusKey(lead.상태 || '대기중');
    const statusText = lead.상태 || '대기중';

    return `
      <tr data-id="${lead.id}">
        <td><input type="checkbox" class="lead-checkbox" value="${lead.id}" onchange="toggleSelect('${lead.id}')"></td>
        <td data-label="접수일">${formatDate(lead.createdTime)}</td>
        <td data-label="이름">${lead.대표자명 || '-'}</td>
        <td data-label="연락처"><a href="tel:${lead.연락처}">${lead.연락처 || '-'}</a></td>
        <td data-label="회사명">${lead.기업명 || '-'}</td>
        <td data-label="업종">${lead.업종 || '-'}</td>
        <td data-label="지역">${lead.지역 || '-'}</td>
        <td data-label="통화가능">${lead.통화가능시간 || '-'}</td>
        <td data-label="직전매출">${lead.직전년도매출 || '-'}</td>
        <td data-label="희망금액">${lead.필요자금규모 || '-'}</td>
        <td data-label="상태">
          <select class="status-select ${statusClass}" onchange="updateStatus('${lead.id}', this.value)">
            <option value="대기중" ${statusText === '대기중' || statusText === '신규' || statusText === '대기' ? 'selected' : ''}>대기중</option>
            <option value="상담중" ${statusText === '상담중' || statusText === '진행중' ? 'selected' : ''}>상담중</option>
            <option value="완료" ${statusText === '완료' ? 'selected' : ''}>완료</option>
            <option value="취소" ${statusText === '취소' ? 'selected' : ''}>취소</option>
          </select>
        </td>
        <td data-label="메모">
          <input type="text" class="memo-input" value="${lead.메모 || ''}"
                 placeholder="메모 입력"
                 onblur="saveMemo('${lead.id}', this.value)">
        </td>
        <td>
          <button class="btn-icon" onclick="openDetailModal('${lead.id}')" title="상세보기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn-icon btn-icon-danger" onclick="deleteLead('${lead.id}')" title="삭제">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 날짜시간 포맷
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 페이지네이션 업데이트
function updatePagination() {
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginationInfo = document.querySelector('.pagination-info');
  const prevBtn = document.querySelector('.pagination-btn:first-child');
  const nextBtn = document.querySelector('.pagination-btn:last-child');

  if (paginationInfo) {
    paginationInfo.textContent = `${currentPage} / ${totalPages} 페이지`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderLeads(); updatePagination(); } };
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderLeads(); updatePagination(); } };
  }
}

// 전체 선택
function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.lead-checkbox');

  checkboxes.forEach(cb => {
    cb.checked = selectAll.checked;
    if (selectAll.checked) {
      if (!selectedLeads.includes(cb.value)) selectedLeads.push(cb.value);
    } else {
      selectedLeads = [];
    }
  });
}

// 개별 선택
function toggleSelect(id) {
  if (selectedLeads.includes(id)) {
    selectedLeads = selectedLeads.filter(i => i !== id);
  } else {
    selectedLeads.push(id);
  }

  // 전체 선택 체크박스 상태 업데이트
  const checkboxes = document.querySelectorAll('.lead-checkbox');
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.checked = selectedLeads.length === checkboxes.length && checkboxes.length > 0;
  }
}

// 상태 변경
async function updateStatus(id, status) {
  try {
    const response = await fetch(`${WORKER_URL}/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 상태: status })
    });

    if (!response.ok) throw new Error('Update failed');

    // 로컬 데이터 업데이트
    const lead = allLeads.find(l => l.id === id);
    if (lead) lead.상태 = status;

    // select 클래스 업데이트
    const select = document.querySelector(`tr[data-id="${id}"] .status-select`);
    if (select) {
      select.className = `status-select ${getStatusKey(status)}`;
    }

    showToast('상태가 변경되었습니다.');
  } catch (error) {
    console.error('Status update error:', error);
    showToast('상태 변경에 실패했습니다.', 'error');
    loadLeads(); // 원래 상태로 복원
  }
}

// 메모 저장
async function saveMemo(id, memo) {
  try {
    const response = await fetch(`${WORKER_URL}/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 메모: memo })
    });

    if (!response.ok) throw new Error('Memo save failed');

    // 로컬 데이터 업데이트
    const lead = allLeads.find(l => l.id === id);
    if (lead) lead.메모 = memo;

  } catch (error) {
    console.error('Memo save error:', error);
    showToast('메모 저장에 실패했습니다.', 'error');
  }
}

// 삭제
async function deleteLead(id) {
  if (!confirm('이 접수 내역을 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`${WORKER_URL}/leads/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Delete failed');

    allLeads = allLeads.filter(l => l.id !== id);
    applyFilters();
    showToast('삭제되었습니다.');
  } catch (error) {
    console.error('Delete error:', error);
    showToast('삭제에 실패했습니다.', 'error');
  }
}

// 상세보기 모달 열기
function openDetailModal(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  currentLeadDetail = lead;

  document.getElementById('detailDate').textContent = formatDateTime(lead.createdTime);
  document.getElementById('detailName').textContent = lead.대표자명 || '-';
  document.getElementById('detailPhone').textContent = lead.연락처 || '-';
  document.getElementById('detailEmail').textContent = lead.이메일 || '-';
  document.getElementById('detailCompany').textContent = lead.기업명 || '-';
  document.getElementById('detailBusiness').textContent = lead.업종 || '-';
  document.getElementById('detailBizNo').textContent = lead.사업자등록번호 || '-';
  document.getElementById('detailAmount').textContent = lead.필요자금규모 || '-';
  document.getElementById('detailRegion').textContent = lead.지역 || '-';
  document.getElementById('detailCallTime').textContent = lead.통화가능시간 || '-';
  document.getElementById('detailRevenue').textContent = lead.직전년도매출 || '-';
  document.getElementById('detailContent').textContent = lead.상담내용 || lead.문의사항 || '-';

  document.getElementById('detailModal').classList.add('open');
}

// 상세보기 모달 닫기
function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('open');
  currentLeadDetail = null;
}

// 전화걸기
function callCustomer() {
  if (currentLeadDetail && currentLeadDetail.연락처) {
    window.location.href = `tel:${currentLeadDetail.연락처}`;
  }
}

// 엑셀 다운로드
function exportToExcel() {
  if (filteredLeads.length === 0) {
    showToast('다운로드할 데이터가 없습니다.', 'error');
    return;
  }

  // CSV 생성
  const headers = ['접수일', '이름', '연락처', '이메일', '회사명', '업종', '지역', '통화가능시간', '직전매출', '희망금액', '상태', '메모'];
  const rows = filteredLeads.map(lead => [
    formatDate(lead.createdTime),
    lead.대표자명 || '',
    lead.연락처 || '',
    lead.이메일 || '',
    lead.기업명 || '',
    lead.업종 || '',
    lead.지역 || '',
    lead.통화가능시간 || '',
    lead.직전년도매출 || '',
    lead.필요자금규모 || '',
    lead.상태 || '대기중',
    lead.메모 || ''
  ]);

  // BOM + CSV
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // 다운로드
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KY_접수내역_${formatDate(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('엑셀 파일이 다운로드되었습니다.');
}

// 토스트 메시지
function showToast(message, type = 'success') {
  // 기존 토스트 제거
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <style>
      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 24px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
    ${message}
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
