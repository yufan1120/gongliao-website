$(document).ready(function() {
    const texts = [
        $('.main-title'),
        $('#text1'),
        $('#text2'),
        $('#text3')
    ];
    
    let currentTextIndex = 0;
    let lastDirection = 'down';
    let isAnimating = false;
    
    // 禁用滾輪滾動
    window.addEventListener('wheel', function(e) {
        if (!$('.start-button').is(':visible') || isAnimating) {
            e.preventDefault();
        }
    }, { passive: false });

    // 禁用觸控滾動
    window.addEventListener('touchmove', function(e) {
        if (!$('.start-button').is(':visible') || isAnimating) {
            e.preventDefault();
        }
    }, { passive: false });
    
    function animateText(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
        const nextIndex = direction === 'down' ? currentTextIndex + 1 : currentTextIndex - 1;
        
        if (nextIndex < 0 || nextIndex > texts.length) {
            isAnimating = false;
            return;
        }
        
        if (nextIndex === texts.length) {
            texts[currentTextIndex].fadeOut(600, function() {
                setTimeout(() => {
                    if (!$('.start-button').is(':visible')) {
                        $('.start-button')
                            .css('display', 'block')
                            .animate({opacity: 1}, 600);
                    }
                    isAnimating = false;
                }, 300);
            });
            currentTextIndex = nextIndex;
            return;
        }

        if (currentTextIndex === texts.length) {
            showText(nextIndex, direction);
            currentTextIndex = nextIndex;
            return;
        }

        showText(nextIndex, direction);
        currentTextIndex = nextIndex;
    }
    
    function showText(index, direction) {
        const currentText = texts[currentTextIndex];
        const nextText = texts[index];
        
        if (direction === 'down') {
            nextText.css({
                opacity: 0,
                display: 'block',
                top: '25%'
            });
        } else {
            nextText.css({
                opacity: 0,
                display: 'block',
                top: '5%'
            });
        }
        
        currentText.animate({
            opacity: 0,
            top: direction === 'down' ? '5%' : '25%'
        }, 600, function() {
            $(this).hide();
            setTimeout(() => {
                nextText.animate({
                    opacity: 1,
                    top: '15%'
                }, 600, function() {
                    isAnimating = false;
                });
            }, 300);
        });
    }
    
    $('.start-button').on('click', function() {
        $('.start-button').fadeOut(600, function() {
            $('body').removeClass('overflow-hidden');
            setTimeout(() => {
                $('.section-container').get(0).scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
    });
    
    function handleScroll() {
        const timelineItems = $('.timeline-item');
        const windowHeight = $(window).height();
        const triggerPoint = windowHeight * 0.7;
        const scrollTop = $(window).scrollTop();

        // 檢查第一個背景是否應該隱藏
        if (scrollTop > windowHeight * 0.3) {
            $('.background-image').css('opacity', '0');
        } else {
            $('.background-image').css('opacity', '1');
        }

        timelineItems.each(function(index) {
            const itemTop = $(this).offset().top;
            const itemPosition = itemTop - scrollTop;

            if (itemPosition < triggerPoint) {
                $(this).addClass('visible');
                
                // 根據不同的項目切換背景
                if (index === 2) { // 青壯年外移
                    $('.bg1').css('opacity', '0');
                    $('.bg2').css('opacity', '1');
                    $('.bg3').css('opacity', '0');
                } else if (index === 3) { // 山海新風貌
                    $('.bg1, .bg2').css('opacity', '0');
                    $('.bg3').css('opacity', '1');
                } else if (index < 2) { // 前兩個項目
                    $('.bg1').css('opacity', '1');
                    $('.bg2, .bg3').css('opacity', '0');
                }
            }
        });
    }
    
    $(window).on('wheel touchmove scroll', handleScroll);
    $(window).on('wheel', function(e) {
        if (!$('.start-button').is(':visible') && !isAnimating) {
            const direction = e.originalEvent.deltaY > 0 ? 'down' : 'up';
            animateText(direction);
            lastDirection = direction;
        }
    });
    
    let touchStartY = 0;
    $(window).on('touchstart', function(e) {
        if (!$('.start-button').is(':visible') && !isAnimating) {
            touchStartY = e.originalEvent.touches[0].clientY;
        }
    });
    
    $(window).on('touchend', function(e) {
        if (!$('.start-button').is(':visible') && !isAnimating) {
            const touchEndY = e.originalEvent.changedTouches[0].clientY;
            const threshold = 5;
            
            if (touchStartY > touchEndY + threshold) {
                animateText('down');
                lastDirection = 'down';
            } else if (touchEndY > touchStartY + threshold) {
                animateText('up');
                lastDirection = 'up';
            }
        }
    });
    
    $(document).on('keydown', function(e) {
        if (!$('.start-button').is(':visible') && !isAnimating) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                animateText('down');
                lastDirection = 'down';
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                animateText('up');
                lastDirection = 'up';
            }
        }
    });

    // 頁面載入時執行一次
    handleScroll();
});