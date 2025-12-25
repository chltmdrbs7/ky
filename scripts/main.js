/* ========================================
   KY 중소기업지원센터 - 메인 스크립트
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // 헤더 & 네비게이션
    // ========================================

    const header = document.getElementById('kyHeader');
    const hamburger = document.getElementById('kyHamburger');
    const mobileMenu = document.getElementById('kyMobileMenu');
    const mobileMenuLinks = document.querySelectorAll('.ky-mobile-nav-link, .ky-mobile-nav-cta');

    let isMenuOpen = false;

    // 모바일 메뉴 토글
    function toggleMenu(forceClose = false) {
        if (forceClose || isMenuOpen) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            isMenuOpen = false;
        } else {
            hamburger.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            isMenuOpen = true;
        }
    }

    // 햄버거 클릭
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    // 모바일 메뉴 링크 클릭 시 닫기
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => toggleMenu(true), 100);
        });
    });

    // ESC 키로 메뉴 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(true);
        }
    });

    // 스크롤 효과
    function handleScroll() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ========================================
    // 카드 마우스 추적 효과 (데스크톱만)
    // ========================================

    if (window.innerWidth > 768) {
        const cards = document.querySelectorAll('.ky-rate-card, .ky-info-item');
        const ctaButtons = document.querySelectorAll('.ky-cta-btn');

        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.style.setProperty('--mx', `${x}px`);
                this.style.setProperty('--my', `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.setProperty('--mx', '50%');
                this.style.setProperty('--my', '50%');
            });
        });

        ctaButtons.forEach(button => {
            button.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.style.setProperty('--mx', `${x}px`);
                this.style.setProperty('--my', `${y}px`);
            });

            button.addEventListener('mouseleave', function() {
                this.style.setProperty('--mx', '50%');
                this.style.setProperty('--my', '50%');
            });
        });
    }

    // ========================================
    // 서비스 탭 전환
    // ========================================

    document.querySelectorAll('#kyService .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#kyService .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#kyService .tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });

    // ========================================
    // 프로세스 카드 마우스 추적
    // ========================================

    document.querySelectorAll('#kyProcess .process-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            this.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
            this.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
    });

    console.log('KY Main Scripts initialized');
})();
