document.addEventListener('DOMContentLoaded', function() {
    // 第一區塊相關元素
    const title = document.getElementById('title');
    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    const text3 = document.getElementById('text3');
    const exploreNav = document.getElementById('exploreNav');
    const introSection = document.querySelector('.intro-section');
    const contentSection = document.querySelector('.content-section');
    let currentState = 0;
    let isAnimating = false;
    let hasNavigated = false;
    let lastScrollTop = 0;
    let touchStartY = 0;
    
    // 第二區塊相關元素
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    const textBlocks = document.querySelectorAll('.text-block');
    const bgImages = document.querySelectorAll('.bg-image');

    // 創建遮罩層
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    document.body.appendChild(overlay);
    
    // 初始化第一區塊
    title.classList.add('active');
    
    // 初始化第二區塊
    function initializeContent() {
        textBlocks[0].classList.add('active');
        textBlocks[1].classList.add('active');
        bgImages[0].classList.add('active');
    }
    
    initializeContent();

    // 防止預設的滾動行為（在導航前）
    document.body.style.overflow = 'hidden';

    // 處理首頁區塊滾動
    function handleScroll(e) {
        if (hasNavigated) return;
        
        const deltaY = e.deltaY || e.touches?.[0].clientY - lastScrollTop;
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        if (deltaY > 0 && currentState < 4) {
            handleScrollDown();
        }
        else if (deltaY < 0 && currentState > 0) {
            handleScrollUp();
        }

        if (e.touches) {
            lastScrollTop = e.touches[0].clientY;
        }
    }

    function handleScrollDown() {
        switch (currentState) {
            case 0:
                switchText(title, text1, 1);
                break;
            case 1:
                switchText(text1, text2, 2);
                break;
            case 2:
                switchText(text2, text3, 3);
                break;
            case 3:
                switchText(text3, null, 4);
                setTimeout(() => {
                    exploreNav.classList.add('active');
                }, 1000);
                break;
        }
    }

    function handleScrollUp() {
        switch (currentState) {
            case 1:
                switchText(text1, title, 0);
                break;
            case 2:
                switchText(text2, text1, 1);
                break;
            case 3:
                switchText(text3, text2, 2);
                break;
            case 4:
                switchText(null, text3, 3);
                exploreNav.classList.remove('active');
                break;
        }
    }

    function switchText(currentText, nextText, newState) {
        if (isAnimating) return;
        isAnimating = true;

        if (currentText) {
            currentText.classList.remove('active');
        }
        
        setTimeout(() => {
            if (nextText) {
                nextText.classList.add('active');
            }
            currentState = newState;
            
            setTimeout(() => {
                isAnimating = false;
            }, 1000);
        }, 1000);
    }

    // 轉場處理函數
    function startTransition(container) {
        // 找到下一個要顯示的區塊
        const nextSection = container.nextElementSibling;
        if (!nextSection) return;
        
        // 標記開始轉場
        container.classList.add('transitioning');
        
        // 顯示遮罩層
        overlay.classList.add('active');
        
        // 禁止滾動
        document.body.style.overflow = 'hidden';
        
        // 顯示 GIF
        const loadingGif = container.querySelector('.loading-gif');
        if (loadingGif) {
            loadingGif.classList.add('visible');
        }

        // 創建下一個區塊的預載容器
        const preloadContainer = document.createElement('div');
        preloadContainer.className = 'next-section';
        preloadContainer.style.backgroundImage = window.getComputedStyle(nextSection).backgroundImage;
        document.body.appendChild(preloadContainer);

        // 1.5秒後開始轉場
        setTimeout(() => {
            // 隱藏 GIF
            if (loadingGif) {
                loadingGif.classList.remove('visible');
            }

            // 顯示預載的下一個區塊
            preloadContainer.classList.add('visible');

            // 等待淡入完成後
            setTimeout(() => {
                // 滾動到下一個區塊
                nextSection.scrollIntoView({ behavior: 'instant' });
                
                // 清理預載容器
                preloadContainer.remove();
                
                // 恢復滾動
                document.body.style.overflow = '';
                
                // 移除轉場標記
                container.classList.remove('transitioning');
                
                // 隱藏遮罩層
                overlay.classList.remove('active');
            }, 500);
        }, 1500);
    }

    // 地圖區域的內容更新
    function updateContent(scrollProgress) {
        if (scrollProgress <= 0.3) {
            showTextBlocks([0, 1]);
            activateBackground(0);
        }
        else if (scrollProgress <= 0.6) {
            showTextBlocks([2]);
            activateBackground(1);
        }
        else {
            showTextBlocks([3]);
            activateBackground(2);
        }
    }

    function showTextBlocks(activeIndexes) {
        textBlocks.forEach((block, index) => {
            if (activeIndexes.includes(index)) {
                block.classList.add('active');
            } else {
                block.classList.remove('active');
            }
        });
    }

    function activateBackground(index) {
        bgImages.forEach((bg, i) => {
            if (i === index) {
                bg.classList.add('active');
            } else {
                bg.classList.remove('active');
            }
        });
    }

    // 導航按鈕點擊事件
    document.querySelector('.explore-btn').addEventListener('click', function() {
        if (!hasNavigated) {
            hasNavigated = true;
            introSection.classList.add('navigated');
            contentSection.classList.add('active');
            document.body.style.overflow = '';

            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    });

    // 主要滾動事件處理
    window.addEventListener('scroll', function() {
        if (!hasNavigated) return;

        // 檢查是否有 loading container 正在轉場
        const isAnyTransitioning = Array.from(document.querySelectorAll('.loading-container')).some(
            container => container.classList.contains('transitioning')
        );

        if (isAnyTransitioning) {
            window.scrollTo(0, lastScrollTop);
            return;
        }

        lastScrollTop = window.pageYOffset;

        // 檢查每個 loading container
        document.querySelectorAll('.loading-container').forEach(container => {
            const rect = container.getBoundingClientRect();
            const threshold = 20; // 允許 20px 的誤差範圍
            
            // 如果到達頂端且沒有正在轉場
            if (rect.top >= -threshold && rect.top <= threshold && !container.classList.contains('transitioning')) {
                startTransition(container);
            }
        });
        
        // 處理地圖區域的滾動
        const rect = stickyWrapper.getBoundingClientRect();
        const scrollProgress = -rect.top / (rect.height - window.innerHeight);
        
        if (scrollProgress >= 0 && scrollProgress <= 1) {
            updateContent(scrollProgress);
        }
    });

    // 事件監聽設置
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchmove', handleScroll, { passive: false });

    // 觸控支援
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    });

    window.addEventListener('touchmove', function(e) {
        if (hasNavigated) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;

        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                handleScrollDown();
            } else {
                handleScrollUp();
            }
            touchStartY = touchY;
        }
    });
});