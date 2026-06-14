// ==UserScript==
// @name         BiliZen - 沉浸式学习模式
// @namespace    biliZen
// @version      1.0.0
// @description  隐藏B站视频页右侧推荐视频列表，保留UP主信息和视频合集；支持右下角开关、Alt+F 快捷键，并记忆偏好
// @icon         https://www.bilibili.com/favicon.ico
// @author       Ttungx
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/list/*
// @match        *://www.bilibili.com/bangumi/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    var STORAGE_KEY = 'bz_focusEnabled';
    var HIDE_CLASS = 'bz-hide-reco';
    // 默认开启沉浸模式（隐藏推荐列表），与 v1.0 行为一致
    var enabled = GM_getValue(STORAGE_KEY, true);

    /* ---------- 1. 注入样式 ---------- */
    GM_addStyle(`
        /* 推荐视频列表 —— 由 html.bz-hide-reco 控制显隐（点击按钮 / Alt+F 切换） */
        html.${HIDE_CLASS} .recommend-list-v1,
        html.${HIDE_CLASS} #reco_list,
        html.${HIDE_CLASS} .rec-list-wrap,
        html.${HIDE_CLASS} .next-play,
        html.${HIDE_CLASS} .recommend-container {
            display: none !important;
        }

        /* 右侧广告区块 —— 始终隐藏（不随开关切换） */
        .ad-report.ad-floor-exp,
        .video-card-ad-small,
        .slide-ad-exp {
            display: none !important;
        }

        /* ---------- 浮动开关按钮 ---------- */
        #bz-toggle-btn {
            position: fixed;
            right: 24px;
            bottom: 100px;
            z-index: 99999;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 16px;
            border: none;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            line-height: 1;
            color: #fff;
            background: #00a1d6;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0, 161, 214, 0.4);
            transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
            user-select: none;
        }
        #bz-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 14px rgba(0, 161, 214, 0.5);
        }
        /* 关闭态：描边、半透明 */
        #bz-toggle-btn.bz-off {
            background: transparent;
            color: #00a1d6;
            border: 1.5px solid #00a1d6;
            box-shadow: none;
            opacity: 0.7;
        }
        #bz-toggle-btn.bz-off:hover {
            opacity: 1;
        }
    `);

    /* ---------- 2. 应用初始状态（document-start 时 <html> 已存在 → 零闪烁） ---------- */
    function applyState() {
        document.documentElement.classList.toggle(HIDE_CLASS, enabled);
    }
    applyState();

    /* ---------- 3. 切换逻辑（更新状态 + 持久化） ---------- */
    function toggle() {
        enabled = !enabled;
        GM_setValue(STORAGE_KEY, enabled);
        applyState();
        updateButton();
    }

    /* ---------- 4. UI（按钮 + 快捷键），等 <body> 就绪后注入 ---------- */
    var btn = null;

    function updateButton() {
        if (!btn) return;
        if (enabled) {
            btn.textContent = '🎯 沉浸中';
            btn.classList.remove('bz-off');
            btn.title = '沉浸模式已开启 · 点击显示推荐 · 快捷键 Alt+F';
        } else {
            btn.textContent = '👁 推荐中';
            btn.classList.add('bz-off');
            btn.title = '沉浸模式已关闭 · 点击隐藏推荐 · 快捷键 Alt+F';
        }
    }

    function initUI() {
        if (document.getElementById('bz-toggle-btn')) return; // 防止重复注入
        btn = document.createElement('button');
        btn.id = 'bz-toggle-btn';
        btn.type = 'button';
        btn.addEventListener('click', toggle);
        updateButton();
        document.body.appendChild(btn);

        // Alt + F 快捷键切换（注：部分浏览器 Alt+F 会触发“文件”菜单，如冲突可自行修改下方按键判断）
        document.addEventListener('keydown', function (e) {
            if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey &&
                e.key && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                toggle();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
