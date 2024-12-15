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
        const nextSection = container.nextElementSibling;
        if (!nextSection) return;
        
        container.classList.add('transitioning');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const loadingGif = container.querySelector('.loading-gif');
        if (loadingGif) {
            loadingGif.classList.add('visible');
        }

        const preloadContainer = document.createElement('div');
        preloadContainer.className = 'next-section';
        preloadContainer.style.backgroundImage = window.getComputedStyle(nextSection).backgroundImage;
        document.body.appendChild(preloadContainer);

        const timeoutId = setTimeout(() => {
            if (container.classList.contains('transitioning')) {
                finishTransition();
            }
        }, 5000);

        setTimeout(() => {
            if (loadingGif) {
                loadingGif.classList.remove('visible');
            }
            preloadContainer.classList.add('visible');

            setTimeout(() => {
                finishTransition();
                clearTimeout(timeoutId);
            }, 500);
        }, 1500);

        function finishTransition() {
            nextSection.scrollIntoView({ behavior: 'instant' });
            preloadContainer.remove();
            document.body.style.overflow = '';
            container.classList.remove('transitioning');
            overlay.classList.remove('active');
        }
    }

    // 地圖區域的內容更新
    function updateMapContent(scrollProgress) {
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

    // 處理長區塊的滾動效果
    function handleLongSection(section) {
        const character1 = section.querySelector('.character1');
        const textBox1 = section.querySelector('.text-box1');
        const textBox2 = section.querySelector('.text-box2');
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = window.pageYOffset + sectionRect.top;
        const windowHeight = window.innerHeight;
        
        const scrollProgress = Math.max(0, Math.min(1, 
            (window.pageYOffset - sectionTop) / windowHeight
        ));
        
        if(character1) {
            const newLeft = 5 + (scrollProgress * 30);
            character1.style.left = `${newLeft}%`;
        }
        
        const textBoxTriggerPoint1 = sectionTop + (windowHeight * 1.3);
        const textBoxTriggerPoint2 = sectionTop + (windowHeight * 1.7);
        
        if(textBox1) {
            if(window.pageYOffset > textBoxTriggerPoint1) {
                textBox1.classList.add('active');
            } else {
                textBox1.classList.remove('active');
            }
        }
        
        if(textBox2) {
            if(window.pageYOffset > textBoxTriggerPoint2) {
                textBox2.classList.add('active');
            } else {
                textBox2.classList.remove('active');
            }
        }
    }

    // 處理移動區塊的滾動效果
    function handleMovingSection(section) {
        // 取得必要的元素
        const movingCharacter = section.querySelector('.moving-character');
        const textBoxes = section.querySelectorAll('.text-box');
        
        // 計算捲動進度
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = window.pageYOffset + sectionRect.top;
        const windowHeight = window.innerHeight;
        const scrollProgress = (window.pageYOffset - sectionTop) / (section.offsetHeight - windowHeight);
        
        // 角色移動處理
        if (scrollProgress >= 0 && scrollProgress <= 0.94) {  // 0% ~ 94% 的捲動範圍內
            // 計算移動距離：從 10px 移動到 螢幕寬度 + 角色寬度
            const totalDistance = window.innerWidth + 300; // 300px 是為了確保完全移出螢幕
            const translateX = 10 + (scrollProgress * totalDistance);  // 起始位置 10px
            movingCharacter.style.transform = `translateX(${translateX}px)`;
            movingCharacter.style.opacity = '1';
        } else if (scrollProgress > 0.94) {  // 超過 94% 後
            movingCharacter.style.opacity = '0';  // 角色消失
        }
        
        // 文字框出現處理
        // 第一個文字框 - 130vh (26% = 130/500)
        if (scrollProgress >= 0.26) {
            textBoxes[0].classList.add('active');
        } else {
            textBoxes[0].classList.remove('active');
        }
        
        // 第二個文字框 - 260vh (52% = 260/500)
        if (scrollProgress >= 0.52) {
            textBoxes[1].classList.add('active');
        } else {
            textBoxes[1].classList.remove('active');
        }
        
        // 第三個文字框 - 390vh (78% = 390/500)
        if (scrollProgress >= 0.78) {
            textBoxes[2].classList.add('active');
        } else {
            textBoxes[2].classList.remove('active');
        }
    }

    // 處理擴展區塊的滾動效果
    function handleExtendedSection(section) {
        const contentWrapper = section.querySelector('.content-wrapper-fade');
        const scrollTextContent = section.querySelector('.scroll-text-content');
        const sectionRect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // 計算區段已滾動的距離
        const sectionScrolled = -sectionRect.top;
        const triggerPoint = windowHeight * 0.4; // 40vh 的觸發點
        
        // 當滾動到 40vh 時顯示內容
        if (sectionScrolled >= triggerPoint) {
            if (contentWrapper) {
                contentWrapper.classList.add('visible');
            }
            
            // 計算文字捲動
            if (scrollTextContent) {
                // 從 40vh 開始計算捲動進度
                const scrollProgress = Math.max(0, Math.min(1, 
                    (sectionScrolled - triggerPoint) / (section.offsetHeight - windowHeight - triggerPoint)
                ));
                
                // 計算文字內容應該移動的距離
                const contentHeight = scrollTextContent.offsetHeight;
                const maxScroll = contentHeight - windowHeight;
                const scrollDistance = maxScroll * scrollProgress;
                
                // 應用位移
                scrollTextContent.style.transform = `translateY(-${scrollDistance}px)`;
            }
        } else {
            if (contentWrapper) {
                contentWrapper.classList.remove('visible');
            }
            // 重置文字位置
            if (scrollTextContent) {
                scrollTextContent.style.transform = 'translateY(0)';
            }
        }
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

        const isAnyTransitioning = Array.from(document.querySelectorAll('.loading-container')).some(
            container => container.classList.contains('transitioning')
        );

        if (isAnyTransitioning) {
            window.scrollTo(0, lastScrollTop);
            return;
        }

        lastScrollTop = window.pageYOffset;

        // 處理長區塊
        const longSections = document.querySelectorAll('.long-section');
        longSections.forEach(section => {
            handleLongSection(section);
        });

        // 處理移動區塊
        const movingSections = document.querySelectorAll('.moving-section');
        movingSections.forEach(section => {
            handleMovingSection(section);
        });

        // 處理擴展區塊
        const extendedSections = document.querySelectorAll('.extended-section');
        extendedSections.forEach(section => {
            handleExtendedSection(section);
        });

        // 處理地圖區域
        const rect = stickyWrapper.getBoundingClientRect();
        const scrollProgress = -rect.top / (rect.height - window.innerHeight);
        if (scrollProgress >= 0 && scrollProgress <= 1) {
            updateMapContent(scrollProgress);
        }

        // 處理 loading containers
        document.querySelectorAll('.loading-container').forEach(container => {
            const rect = container.getBoundingClientRect();
            const threshold = 20;
            
            if (rect.top >= -threshold && rect.top <= threshold && !container.classList.contains('transitioning')) {
                startTransition(container);
            }
        });
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