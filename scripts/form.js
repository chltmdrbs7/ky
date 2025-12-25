/* ========================================
   KY 중소기업지원센터 - 폼 스크립트
   Google Apps Script 연동
   ======================================== */

(function() {
    'use strict';

    // Google Apps Script 웹앱 URL
    const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwZ9MaPYsDlAxpR4_FUhJG89kd3FfXE7xU5TEL2qmiIZUSIqxxbr2cBSm8h3zCmdJ1i6w/exec';

    // 폼 제출 핸들러
    const consultForm = document.getElementById('consultForm');

    if (!consultForm) return;

    consultForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const form = event.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const fundTypes = document.querySelectorAll('input[name="fundType"]:checked');
        if (fundTypes.length === 0) {
            alert('지원받고 싶은 자금 종류를 하나 이상 선택해주세요.');
            return;
        }

        const submitButton = document.getElementById('submitButton');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');

        submitButton.disabled = true;
        submitButton.textContent = '신청 중...';
        if (successMessage) successMessage.classList.remove('active');
        if (errorMessage) errorMessage.classList.remove('active');

        const formData = {
            company: form.company.value,
            bizno: form.bizno.value,
            name: form.name.value,
            position: form.position.value || '',
            phone: form.phone.value,
            email: form.email.value,
            industry: form.industry.value || '',
            founded: form.founded.value || '',
            consultTime: form.consultTime.value,
            amount: form.amount.value || '',
            fundType: Array.from(fundTypes).map(cb => cb.value).join(', '),
            message: form.message.value || '',
            privacy: form.privacy.checked ? 'true' : 'false'
        };

        try {
            await fetch(WEBAPP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (successMessage) successMessage.classList.add('active');
            submitButton.textContent = '무료 상담 신청하기';
            form.reset();

            setTimeout(() => {
                if (successMessage) successMessage.classList.remove('active');
                submitButton.disabled = false;
            }, 5000);

        } catch (error) {
            console.error('Error:', error);
            if (errorMessage) errorMessage.classList.add('active');
            submitButton.disabled = false;
            submitButton.textContent = '무료 상담 신청하기';

            setTimeout(() => {
                if (errorMessage) errorMessage.classList.remove('active');
            }, 5000);
        }
    });

    // 사업자등록번호 자동 포맷팅
    const biznoInput = document.querySelector('input[name="bizno"]');
    if (biznoInput) {
        biznoInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 3 && value.length <= 5) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length > 5) {
                value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 10);
            }
            e.target.value = value;
        });
    }

    // 전화번호 자동 포맷팅
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 3 && value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length > 7) {
                value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
            }
            e.target.value = value;
        });
    }

    console.log('KY Form initialized');
})();

// 개인정보 동의 자세히보기 토글 (전역 함수)
function togglePrivacyDetail() {
    const content = document.getElementById('privacyContent');
    if (content) {
        content.classList.toggle('show');
    }
}
