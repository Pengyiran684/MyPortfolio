// --- 0. 光标逻辑 ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
let outlineX = window.innerWidth / 2, outlineY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;

    // 保证 target 为 Element（避免文本节点导致 .closest 抛错）
    const el = (e.target instanceof Element) ? e.target : e.target.parentElement;
    const isHoverTarget = el && (el.closest('.nav-item') || el.closest('.card') || el.closest('.close-btn') || el.closest('.mp-btn'));
    if (isHoverTarget) document.body.classList.add('hovering');
    else document.body.classList.remove('hovering');
});

function animateCursor() {
    outlineX += (cursorX - outlineX) * 0.2; 
    outlineY += (cursorY - outlineY) * 0.2;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    requestAnimationFrame(animateCursor);
}
animateCursor();


// --- 1. 唯美粒子系统 (Bokeh + Dust) ---
const particleCanvas = document.getElementById('particle-canvas');
const ctx = particleCanvas.getContext('2d');
let particles = [];
let winW = window.innerWidth;
let winH = window.innerHeight;

function resizeCanvas() {
    winW = window.innerWidth;
    winH = window.innerHeight;
    particleCanvas.width = winW;
    particleCanvas.height = winH;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(type) {
        this.type = type; // 'bokeh' or 'dust'
        this.init();
    }

    init() {
        this.x = Math.random() * winW;
        this.y = Math.random() * winH;
        
        if (this.type === 'bokeh') {
            this.size = Math.random() * 20 + 20; 
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.alpha = Math.random() * 0.1 + 0.05; 
            this.blur = Math.random() * 10 + 10; 
        } else {
            this.size = Math.random() * 1.5 + 0.5;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.alpha = Math.random() * 0.5 + 0.3;
            this.blur = 0;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // 交互扰动
        if (this.type === 'dust') {
            const dx = this.x - cursorX;
            const dy = this.y - cursorY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const forceDist = 120; 
            
            if (dist < forceDist) {
                const angle = Math.atan2(dy, dx);
                const force = (forceDist - dist) / forceDist;
                const push = force * 2; 
                
                this.vx += Math.cos(angle) * push * 0.1;
                this.vy += Math.sin(angle) * push * 0.1;
            }
            
            const maxSpeed = 1.5;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (speed > maxSpeed) {
                this.vx *= 0.95;
                this.vy *= 0.95;
            }
        }

        if (this.x < -50) this.x = winW + 50;
        if (this.x > winW + 50) this.x = -50;
        if (this.y < -50) this.y = winH + 50;
        if (this.y > winH + 50) this.y = -50;

        this.draw();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.type === 'bokeh') {
            ctx.shadowBlur = this.blur;
            ctx.shadowColor = "rgba(0, 243, 255, 0.8)";
            ctx.fillStyle = "rgba(0, 243, 255, " + this.alpha + ")";
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(200, 230, 255, " + this.alpha + ")";
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; 
    }
}

for (let i = 0; i < 25; i++) particles.push(new Particle('bokeh'));
for (let i = 0; i < 80; i++) particles.push(new Particle('dust'));


// --- 2. 轮盘逻辑 ---
// 在 script.js 顶部找到 projects 数组并修改
const projects = [
    { 
        id: 1, 
        title: "Traditional_Patterns", 
        img: "img/《敦煌藻井临摹改造》.jpg",
        gallery: [
        "img/《敦煌藻井临摹改造》.jpg", 
        "img/《福》.jpg", 
        "img/《古今中外》.jpg", 
        "img/《梁祝·吻》.jpg" 
    ],
        desc: "<p>基于传统纹样的创新重构。将东方美学与现代化设计相结合，生成了无限延展的纹理系统。</p>",
        stack: "Pen，Ink，Pigment",
        status: "Finished"
    },
    // ... 请依照此格式继续补充剩下的项目 ...
    { 
        id: 2, 
        title: "App_UI/UX", 
        img: "img/app1.png",
        gallery: [
        "img/app1.png", 
        "img/app2.png", 
        "img/app3.png", 
        { 
        src: "video/app视频示范.mp4", 
        thumb: "img/app1.png" 
        }
    ],
        desc: "涵盖从用户研究、信息架构到高保真原型的设计全流程，通过体现我以用户为中心、解决实际问题的产品思维。</p>",
        stack: "Figma, Illustrator",
        status: "Prototype"
    },
    // ... 保持原有数组长度，把后面几个也加上 desc, stack, status ...
    { id: 3, title: "Game_Image", img: "img/Image.png",
         gallery: [
       { 
        src: "video/Image游戏视频.mp4",      // 视频文件的路径
        thumb: "img/Image.png"      // 你想显示的该视频的缩略图路径
        }
        ],
        desc: "游戏美术设定。负责游戏整体视觉风格的制定，包括角色设计、场景构建与道具设定等。通过色彩与构图的运用，营造出独特的游戏氛围。作为核心成员负责横版解密游戏的美术设计。使用Aseprite和Photoshop完成人物设计、界面与视觉元素制作，提升游戏视觉吸引力，使demo在校内Gamejam中成功展示并获得好评。", 
        stack: "Photoshop，Aseprite", 
        status: "Demo" },
    { id: 4, title: "Light_Documentary", 
        img: "img/频率失真4.jpg", 
        gallery: [
        "img/频率失真3.jpg", 
        "img/频率失真2.jpg", 
        "img/频率失真1.jpg", 
       { 
        src: "video/《频率失真》.mp4",      // 视频文件的路径
        thumb: "img/频率失真4.jpg"      // 你想显示的该视频的缩略图路径
        }
        ],
        desc: "基于pr和ae的短片制作。负责整个纪录片的全部工作，包括前期共同、脚本、分镜、拍摄与剪辑等。主要记录校园乐队的最后一场演出，以及成员们之间为何越走越远的故事。", 
        stack: "Pr，AE，Camera", 
        status: "Finished" },
    { id: 5, title: "Picture_Book", 
        img: "img/乌鸡3.png", 
         gallery: [
        "img/乌鸡3.png", 
        "img/乌鸡2.png", 
        "img/乌鸡1.png", 
        "img/友谊的翅膀3.png", 
        "img/友谊的翅膀2.png", 
        "img/友谊的翅膀1.png", 
       { 
        src: "video/乌骨生花.mp4",      // 视频文件的路径
        thumb: "img/乌鸡3.png"      // 你想显示的该视频的缩略图路径
        }
        ,{ 
        src: "video/友谊的翅膀.mp4",      // 视频文件的路径
        thumb: "img/友谊的翅膀3.png"      // 你想显示的该视频的缩略图路径
        }
        ],
        desc: "负责绘本设计与AI辅助内容生成，借助Midjourney、Photoshop和Illustrator。以“乌骨鸡”为主题完成20页绘本故事内容与画面制作，解决了AI生成内容在叙事连贯性上的不足，将零散图像整合为有起承转合的完整故事体验，高效产出高质量内容。", 
        stack: "Procreate, Midjourney, Photoshop, Proceate, Illustrator", 
        status: "Finished" },
    { id: 6, title: "Movable_Book",
        img: "img/身体书.jpg", 
         gallery: [
       { 
        src: "video/身体书.mp4",      // 视频文件的路径
        thumb: "img/身体书.jpg"      // 你想显示的该视频的缩略图路径
        }
        ],
        desc: "立体书结构设计。", 
        stack: "Paper, Mixed Materials, Pen", 
        status: "Model" },
    { id: 7, title: "Brand_Design", 
        img: "img/东一1.png", 
         gallery: [
        "img/东一5.png", 
        "img/东一6.png", 
        "img/东一7.png", 
        "img/东一9.png", 
        "img/东一10.png", 
        "img/东一13.png", 
    ],
        desc: "品牌视觉识别系统焕新设计。", 
        stack: "AI, PS, NanoBanana", 
        status: "Delivered" },
    { id: 8, title: "AD_Design", 
        img: "img/大广节日本惠比寿.png", 
        gallery: [
        "img/大广节日本惠比寿.png", 
        "img/大广节希腊赫耳墨斯.png", 
        "img/大广节印度拉克希米.png", 
    ],
        desc: "商业广告海报设计。", 
        stack: "Procreate, Illustrator", 
        status: "Delivered" }
];

const RADIUS_CARD = 1500; 
const RADIUS_NUM = 1280;   
const RADIUS_TITLE = 1300; 

const SPACING_ANGLE = 16; 
const TOTAL_ARC = projects.length * SPACING_ANGLE; 

const ACTIVE_SCALE = 1.3; 
const NORMAL_SCALE = 0.85;
const ACTIVE_OFFSET = -100; 
const HOVER_OFFSET = -40; 

let currentRotation = 0;
let targetRotation = 0;
let isDragging = false;
let startY = 0;
let lastActiveIndex = -1;

const pivot = document.getElementById('wheelPivot');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalMainImg');
const bgLayer1 = document.getElementById('bg-layer-1');
const bgLayer2 = document.getElementById('bg-layer-2');
let currentBgLayer = 1;

const cardElements = [];
const numElements = [];
const titleElements = [];

function init() {
    projects.forEach((proj, index) => {
        // 1. 卡片
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${proj.img}" class="card-image" loading="lazy" alt="${proj.title}">
            <div class="card-glare"></div>
            <div class="card-overlay"></div>
        `;
        
        card.addEventListener('mouseenter', () => {
            cardElements[index].targetHoverOffset = HOVER_OFFSET;
        });
        card.addEventListener('mouseleave', () => {
            cardElements[index].targetHoverOffset = 0;
        });
        card.addEventListener('click', () => {
            const currentDist = parseFloat(card.dataset.dist || 100);
            if (currentDist < 20) openModal(proj);
            else {
                const rect = card.getBoundingClientRect();
                const centerY = window.innerHeight / 2;
                if (rect.top + rect.height/2 < centerY) targetRotation -= SPACING_ANGLE; 
                else targetRotation += SPACING_ANGLE; 
            }
        });

        pivot.appendChild(card);
        cardElements.push({
            el: card,
            glare: card.querySelector('.card-glare'),
            index: index,
            data: proj,
            currentHoverOffset: 0, 
            targetHoverOffset: 0
        });

        // 2. 序号 (横排)
        const num = document.createElement('div');
        num.className = 'wheel-number';
        num.textContent = `idx_${(index + 1).toString().padStart(2, '0')}`;
        pivot.appendChild(num);
        numElements.push({ el: num, index: index });

        // 3. 标题 (围绕圆心)
        const title = document.createElement('div');
        title.className = 'wheel-title';
        title.textContent = proj.title;
        pivot.appendChild(title);
        titleElements.push({ el: title, index: index });
    });

    updateBackground(projects[0].img, true);
    
    setTimeout(() => {
        document.body.classList.add('loaded');
        animateLoop(); // 启动主循环
    }, 1500); 
}

function animateMain() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach(p => p.update());

    currentRotation += (targetRotation - currentRotation) * 0.08;

    // 背景视差
    const px = (cursorX - winW/2) * 0.01;
    const py = (cursorY - winH/2) * 0.01;
    if(currentBgLayer === 1) {
        bgLayer1.style.transform = `translate(${px * 2}px, ${py * 2}px) scale(1.05)`;
        bgLayer2.style.transform = `translate(${px * 2}px, ${py * 2}px) scale(1.05)`;
    }

    let closestDist = Infinity;
    let activeItem = null;

    for (let i = 0; i < projects.length; i++) {
        const item = cardElements[i];
        const numItem = numElements[i];
        const titleItem = titleElements[i];

        let baseAngle = i * SPACING_ANGLE;
        let angle = (baseAngle + currentRotation) % TOTAL_ARC;
        if (angle > TOTAL_ARC / 2) angle -= TOTAL_ARC;
        if (angle < -TOTAL_ARC / 2) angle += TOTAL_ARC;
        
        const distance = Math.abs(angle); 
        if (distance < closestDist) {
            closestDist = distance;
            activeItem = item;
        }

        let influence = Math.max(0, 1 - distance / 25); 
        influence = Math.pow(influence, 3); 

        const rad = angle * (Math.PI / 180);
        const rotate = angle * -1; 

        // --- 1. 卡片动态 ---
        item.currentHoverOffset += (item.targetHoverOffset - item.currentHoverOffset) * 0.1;
        const scale = NORMAL_SCALE + (influence * (ACTIVE_SCALE - NORMAL_SCALE));
        const offsetX = (influence * ACTIVE_OFFSET) + item.currentHoverOffset; 
        
        const cardX = -RADIUS_CARD * Math.cos(rad) + offsetX; 
        const cardY = RADIUS_CARD * Math.sin(rad);

        item.el.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) rotate(${rotate}deg) scale(${scale})`;
        
        let opacity = 0;
        if (distance <= 70) opacity = 1 - (distance / 70);
        item.el.style.opacity = opacity;
        item.el.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        item.el.style.zIndex = Math.round(influence * 100) + (item.targetHoverOffset !== 0 ? 50 : 0);

        if (distance < 3) item.el.classList.add('active');
        else item.el.classList.remove('active');
        
        item.el.dataset.dist = distance;

        if (opacity > 0.5) {
            const glareOp = Math.max(0, 1 - Math.abs(angle + 10) / 20) * 0.6;
            item.glare.style.opacity = glareOp;
        } else {
            item.glare.style.opacity = 0;
        }

        // --- 2. 序号动态 (跟随卡片offsetX) ---
        const numX = -RADIUS_NUM * Math.cos(rad) + offsetX; 
        const numY = RADIUS_NUM * Math.sin(rad);
        
        numItem.el.style.transform = `translate3d(${numX}px, ${numY}px, 0) rotate(${rotate}deg)`;
        numItem.el.style.opacity = opacity;

        if (distance < 3) numItem.el.classList.add('active');
        else numItem.el.classList.remove('active');

        // --- 3. 标题动态 ---
        const titleX = -RADIUS_TITLE * Math.cos(rad);
        const titleY = RADIUS_TITLE * Math.sin(rad);
        
        titleItem.el.style.transform = `translate3d(${titleX}px, ${titleY}px, 0) rotate(${rotate}deg)`;
        
        let titleOpacity = 0;
        if (distance <= 30) titleOpacity = 1 - (distance / 30);
        titleItem.el.style.opacity = titleOpacity;

        if (distance < 3) titleItem.el.classList.add('active');
        else titleItem.el.classList.remove('active');
    }

    if (activeItem && activeItem.index !== lastActiveIndex && closestDist < 5) {
        updateBackground(activeItem.data.img);
        lastActiveIndex = activeItem.index;
    }
}

function updateBackground(imageUrl, immediate = false) {
    const activeLayer = currentBgLayer === 1 ? bgLayer1 : bgLayer2;
    const nextLayer = currentBgLayer === 1 ? bgLayer2 : bgLayer1;

    // 假设你有本地图片，这里会变成 img/xxx.jpg
    nextLayer.style.backgroundImage = `url(${imageUrl})`;
    
    if (immediate) {
        nextLayer.classList.add('active');
        activeLayer.classList.remove('active');
    } else {
        nextLayer.classList.add('active');
        activeLayer.classList.remove('active');
    }
    currentBgLayer = currentBgLayer === 1 ? 2 : 1;
}

// 统一循环
function animateLoop() {
    // 光标动画
    outlineX += (cursorX - outlineX) * 0.2; 
    outlineY += (cursorY - outlineY) * 0.2;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    // 粒子和轮盘
    animateMain();

    requestAnimationFrame(animateLoop);
}

// 事件监听
window.addEventListener('wheel', (e) => {
    if (modal.classList.contains('open')) return;
    const delta = e.deltaY * 0.04; 
    targetRotation -= delta;
});

window.addEventListener('touchstart', (e) => {
    if (modal.classList.contains('open')) return;
    isDragging = true;
    startY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    if (modal.classList.contains('open')) return;
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    targetRotation -= diff * 0.15; 
    startY = currentY;
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false;
    if (!modal.classList.contains('open')) snapToGrid();
});

let wheelTimeout;
window.addEventListener('wheel', () => {
    if (modal.classList.contains('open')) return;
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(snapToGrid, 150);
});

function snapToGrid() {
    const step = Math.round(targetRotation / SPACING_ANGLE);
    targetRotation = step * SPACING_ANGLE;
}

/* 替换 script.js 中原有的 openModal 函数，新增画廊支持 */
let _galleryState = {
    imgs: [],
    idx: 0,
    thumbEls: [],
    // 我们只需要存这一个全局键盘事件，按钮事件用 onclick 覆盖即可
    globalKeyHandler: null 
};

/* --- 替换 buildGallery 函数 --- */
function buildGallery(imgs) {
    _galleryState.imgs = imgs.slice();
    _galleryState.idx = 0;
    _galleryState.thumbEls = [];

    const mainImg = document.getElementById('modalMainImg');
    const mainVideo = document.getElementById('modalMainVideo'); 
    const thumbs = document.getElementById('modalThumbs');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const counter = document.getElementById('galleryCounter');

    // 安全检查：缺任何一个元素都不执行
    if (!mainImg || !thumbs || !counter || !prevBtn || !nextBtn) return;

    // 1. 清空缩略图区域
    thumbs.innerHTML = '';

    // 2. 生成缩略图
    imgs.forEach((item, i) => {
        const t = document.createElement('img');
        
        // [新增逻辑] 判断 item 是字符串还是对象
        // 如果是对象，则分别提取 src 和 thumb；如果是字符串，src 就是 item 本身
        const src = typeof item === 'string' ? item : item.src;
        const customThumb = typeof item === 'string' ? null : item.thumb;

        // 检测是否为视频
        if (src.toLowerCase().match(/\.(mp4|webm|mov)$/)) {
            // [修改点]：如果有自定义缩略图，就用自定义的；否则用默认图标
            if (customThumb) {
                t.src = customThumb;
                t.style.padding = "0"; // 自定义封面通常是满铺的，不需要内边距
                t.style.objectFit = "cover"; // 保证填满
            } else {
                // 如果没配封面，还是显示默认的小图标
                t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E";
                t.style.backgroundColor = "#1a3c5a"; 
                t.style.padding = "10px"; 
            }
        } else {
            // 普通图片
            t.src = src;
        }

        t.className = 'thumb';
        t.alt = `thumb-${i+1}`;
        
        // 点击事件
        t.onclick = () => showGalleryIndex(i);
        
        thumbs.appendChild(t);
        _galleryState.thumbEls.push(t);
    });

    // 3. 绑定左右按钮 (使用 onclick 防止累积绑定)
    prevBtn.onclick = (e) => {
        e.stopPropagation(); // 防止冒泡
        showGalleryIndex((_galleryState.idx - 1 + imgs.length) % imgs.length);
    };

    nextBtn.onclick = (e) => {
        e.stopPropagation();
        showGalleryIndex((_galleryState.idx + 1) % imgs.length);
    };

    // 4. 绑定键盘事件 (先移除旧的，再加新的)
    if (_galleryState.globalKeyHandler) {
        window.removeEventListener('keydown', _galleryState.globalKeyHandler);
    }
    
    _galleryState.globalKeyHandler = (e) => {
        if (!document.getElementById('modal')?.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') prevBtn.click(); // 借用按钮点击逻辑
        if (e.key === 'ArrowRight') nextBtn.click();
    };
    window.addEventListener('keydown', _galleryState.globalKeyHandler);

    // 5. 显示第一张
    showGalleryIndex(0);
}

/* --- 替换 showGalleryIndex 函数的开头部分 --- */

function showGalleryIndex(i) {
    const imgs = _galleryState.imgs;
    if (!imgs || imgs.length === 0) return;
    
    const mainImg = document.getElementById('modalMainImg');
    const mainVideo = document.getElementById('modalMainVideo');
    const counter = document.getElementById('galleryCounter');

    _galleryState.idx = ((i % imgs.length) + imgs.length) % imgs.length;
    
    // [新增逻辑] 获取当前项的数据
    const item = imgs[_galleryState.idx];
    // 无论 item 是字符串还是对象，我们都提取出实际的文件路径给 currentSrc
    const currentSrc = typeof item === 'string' ? item : item.src;
    
    // 检测后缀名
    const isVideo = currentSrc.toLowerCase().match(/\.(mp4|webm|mov)$/);

    if (isVideo) {
        // ... (下面的逻辑保持不变，直接复制原来的即可) ...
        mainImg.style.display = 'none';
        if (mainVideo) {
            mainVideo.style.display = 'block';
            mainVideo.src = currentSrc;
            mainVideo.play().catch(() => {}); 
        }
    } else {
        // ... (下面的逻辑保持不变) ...
        if (mainVideo) {
            mainVideo.pause(); 
            mainVideo.style.display = 'none';
            mainVideo.src = "";
        }
        if (mainImg) {
            mainImg.style.display = 'block';
            mainImg.src = currentSrc;
            mainImg.alt = `Image ${_galleryState.idx + 1}`;
        }
    }
}

/* --- 替换 cleanupGallery 函数 --- */
/* --- 替换 cleanupGallery 函数 --- */
function cleanupGallery() {
    // 1. 移除键盘监听
    if (_galleryState.globalKeyHandler) {
        window.removeEventListener('keydown', _galleryState.globalKeyHandler);
        _galleryState.globalKeyHandler = null;
    }
    
    // 2. 清理按钮事件 (置空即可)
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    if (prevBtn) prevBtn.onclick = null;
    if (nextBtn) nextBtn.onclick = null;

    // 3. 清理数据
    _galleryState.thumbEls = [];
    _galleryState.imgs = [];
    _galleryState.idx = 0;
    
    // 4. 清理 DOM 内容
    const thumbs = document.getElementById('modalThumbs');
    if (thumbs) thumbs.innerHTML = '';
    
    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) {
        mainImg.src = '';
        mainImg.style.display = 'block'; 
    }

    // 5. 暂停并隐藏视频
    const mainVideo = document.getElementById('modalMainVideo');
    if (mainVideo) {
        mainVideo.pause();
        mainVideo.src = ""; // 移除源，防止后台加载
        mainVideo.load();   // 彻底重置
        mainVideo.style.display = 'none'; 
    }
}

/* --- 修改后的 openModal --- */
function openModal(project) {
    // 基础字段填充
    modalTitle.textContent = project.title || '';
    const statusEl = document.getElementById('modalStatus');
    const stackEl = document.getElementById('modalStack');
    const descEl = document.getElementById('modalDesc');

    if (statusEl) statusEl.textContent = project.status || '';
    if (stackEl) stackEl.textContent = project.stack || '';
    if (descEl) descEl.innerHTML = project.desc || '<p>暂无描述信息 / No description provided.</p>';

    // 处理画廊图片列表
    let imgs = [];
    if (Array.isArray(project.gallery) && project.gallery.length) imgs = project.gallery.slice();
    else if (project.img) imgs = [project.img];
    
    imgs = imgs.filter(Boolean);

    cleanupGallery();
    buildGallery(imgs);

    // [关键修改]：
    // 因为我们用 visibility 做动画，不再需要 display:none
    // 直接添加 .open 类，CSS 会处理过渡
    modal.classList.add('open');
}

/* --- 修改后的 closeModal --- */
window.closeModal = function() {
    if (modal) {
        modal.classList.remove('open');
        setTimeout(() => {
            cleanupGallery();
        }, 400); 
    }
};

/* --- 音乐播放器逻辑 --- */
(() => {
    const playlist = [
        { src: 'music/近未来.mp3', title: '近未来' },
        { src: 'music/暂时失控.mp3', title: '暂时失控' },
        { src: 'music/哥伦布的蛋.mp3', title: '哥伦布的蛋' },
    ];

    const audio = document.getElementById('mpAudio');
    const playBtn = document.getElementById('mpPlay');
    const prevBtn = document.getElementById('mpPrev');
    const nextBtn = document.getElementById('mpNext');
    const titleEl = document.getElementById('mpTitle');
    const progress = document.getElementById('mpProgress');
    const volume = document.getElementById('mpVolume');

    if (!audio || !playBtn || !prevBtn || !nextBtn || !titleEl || !progress || !volume) return;

    let idx = 0;
    let updatingProgress = false;

    function setPlayUI(isPlaying) {
        playBtn.textContent = isPlaying ? '⏸' : '▶️';
        playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }

    function loadTrack(i) {
        if (!playlist[i]) return;
        // 对路径做 encode，避免中文文件名导致请求失败
        audio.src = encodeURI(playlist[i].src);
        titleEl.textContent = playlist[i].title;
        audio.load();
        setPlayUI(false);
    }

    async function togglePlay() {
        try {
            if (audio.paused) {
                // user gesture (click) usually allows play(),但仍捕获错误
                await audio.play();
                setPlayUI(true);
            } else {
                audio.pause();
                setPlayUI(false);
            }
        } catch (err) {
            console.error('播放失败：', err);
            // 给用户提示（可改为 UI 提示）
            setPlayUI(false);
        }
    }

    function prevTrack() {
        idx = (idx - 1 + playlist.length) % playlist.length;
        loadTrack(idx);
        audio.play().then(() => setPlayUI(true)).catch(e => { console.error(e); setPlayUI(false); });
    }

    function nextTrack() {
        idx = (idx + 1) % playlist.length;
        loadTrack(idx);
        audio.play().then(() => setPlayUI(true)).catch(e => { console.error(e); setPlayUI(false); });
    }

    // 事件绑定
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        updatingProgress = true;
        progress.value = pct;
        updatingProgress = false;
    });

    progress.addEventListener('input', (e) => {
        if (!audio.duration) return;
        const val = Number(e.target.value);
        audio.currentTime = (val / 100) * audio.duration;
    });

    volume.addEventListener('input', (e) => {
        audio.volume = Number(e.target.value);
    });

    audio.addEventListener('ended', nextTrack);

    // 初始化
    if (playlist.length) {
        loadTrack(0);
        audio.volume = Number(volume.value);
    } else {
        titleEl.textContent = 'No tracks';
        playBtn.disabled = true;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
})();

// 启动
init();