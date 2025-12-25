/* ========================================
   KY 중소기업지원센터 - 게시판 스크립트
   Cloudflare Worker API 연동
   ======================================== */

(function() {
    'use strict';

    const API_URL = 'https://ky.chltmdrbs7.workers.dev/posts';
    const POSTS_PER_PAGE = 6;

    let currentPage = 1;
    let allPosts = [];
    let isLoading = false;

    // DOM 요소
    const loadingEl = document.getElementById('ky-board-loading');
    const emptyEl = document.getElementById('ky-board-empty');
    const gridEl = document.getElementById('ky-board-grid');
    const moreEl = document.getElementById('ky-board-more');
    const loadMoreBtn = document.getElementById('ky-load-more-btn');
    const modalOverlay = document.getElementById('ky-board-modal-overlay');
    const modalClose = document.getElementById('ky-board-modal-close');

    // 요소가 없으면 종료
    if (!gridEl) return;

    // Worker API에서 데이터 가져오기
    async function fetchPosts() {
        if (isLoading) return;
        isLoading = true;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!data.posts || data.posts.length === 0) {
                showEmpty();
                return;
            }

            allPosts = data.posts;

            if (allPosts.length === 0) {
                showEmpty();
            } else {
                renderPosts();
            }

        } catch (error) {
            console.error('게시글 로드 오류:', error);
            showEmpty();
        } finally {
            isLoading = false;
        }
    }

    function showEmpty() {
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (gridEl) gridEl.style.display = 'none';
        if (moreEl) moreEl.style.display = 'none';
    }

    function renderPosts() {
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        if (gridEl) gridEl.style.display = '';

        const endIndex = currentPage * POSTS_PER_PAGE;
        const postsToShow = allPosts.slice(0, endIndex);

        gridEl.innerHTML = postsToShow.map((post, index) => createCardHTML(post, index)).join('');

        // 더보기 버튼 표시 여부
        if (moreEl) {
            if (allPosts.length > endIndex) {
                moreEl.style.display = 'block';
            } else {
                moreEl.style.display = 'none';
            }
        }

        // 카드 클릭 이벤트 - post.html로 이동
        gridEl.querySelectorAll('.board-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.id;
                window.location.href = `post.html?id=${postId}`;
            });
        });
    }

    function createCardHTML(post, index) {
        const thumbnailHTML = post.thumbnail
            ? `<img src="${post.thumbnail}" alt="${post.title}" loading="lazy">`
            : `<div class="card-placeholder"><svg viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg></div>`;

        return `
            <article class="board-card" data-id="${post.id}" style="animation-delay: ${(index % POSTS_PER_PAGE) * 0.1}s">
                <div class="card-thumbnail">${thumbnailHTML}</div>
                <div class="card-content">
                    <span class="card-category">${post.category}</span>
                    <h3 class="card-title">${post.title}</h3>
                    <div class="card-meta">
                        <span class="card-date">
                            <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                            ${post.date}
                        </span>
                        <span class="card-views">
                            <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                            ${post.views}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    function openModal(post) {
        const modalImage = document.getElementById('ky-modal-image');
        const modalCategory = document.getElementById('ky-modal-category');
        const modalTitle = document.getElementById('ky-modal-title');
        const modalDate = document.getElementById('ky-modal-date');
        const modalViews = document.getElementById('ky-modal-views');
        const modalBody = document.getElementById('ky-modal-body');

        if (modalImage) {
            modalImage.src = post.thumbnail || '';
            modalImage.style.display = post.thumbnail ? 'block' : 'none';
        }
        if (modalCategory) modalCategory.textContent = post.category;
        if (modalTitle) modalTitle.textContent = post.title;
        if (modalDate) modalDate.querySelector('span').textContent = post.date;
        if (modalViews) modalViews.querySelector('span').textContent = `조회 ${post.views}`;
        if (modalBody) modalBody.textContent = post.content;

        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 이벤트 리스너
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderPosts();
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // 초기 로드
    fetchPosts();

    console.log('KY Board initialized');
})();
