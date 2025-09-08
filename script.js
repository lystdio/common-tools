/*
 * @Description: 前端工具库
 * @Version: 1.0.0
 * @Author: Li Yang
 * @Date: 2025-09-03 22:55:55
 * @LastEditors: Li Yang
 * @LastEditTime: 2025-09-08 15:58:38
 */

// 工具库主脚本
class FrontendTools {
    constructor() {
        this.cache = new Map(); // DOM元素缓存
        this.init();
    }

    // DOM查询缓存方法
    $(id) {
        if (!this.cache.has(id)) {
            this.cache.set(id, document.getElementById(id));
        }
        return this.cache.get(id);
    }


    init() {
        this.initTabs();
        this.initFieldTranslator();
        this.initImageToBase64();
        this.initJsonFormatter();
        this.initBase64Encoder();
        this.initQRGenerator();
        this.initPasswordGenerator();
        this.initRegexTester();
        this.initHashCalculator();
        this.initNumberConverter();
    }

    // Tab切换功能
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // 移除所有active类
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // 添加active类到当前选中的tab
                btn.classList.add('active');
                this.$(targetTab).classList.add('active');
            });
        });
    }

    // 图片转Base64
    initImageToBase64() {
        const fileInput = this.$('imageFile');
        const resultTextarea = this.$('base64Result');
        const copyBtn = this.$('copyBase64');
        const preview = this.$('imagePreview');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    resultTextarea.value = base64;
                    
                    // 显示图片预览
                    preview.innerHTML = `<img src="${base64}" alt="预览图片">`;
                };
                reader.readAsDataURL(file);
            }
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(resultTextarea.value, copyBtn);
        });
    }

    // JSON格式化工具
    initJsonFormatter() {
        const jsonInput = this.$('jsonInput');
        const jsonResult = this.$('jsonResult');
        const statusDiv = this.$('jsonStatus');

        const buttonConfigs = [
            {
                id: 'formatJson',
                handler: () => {
                    try {
                        const parsed = JSON.parse(jsonInput.value);
                        jsonResult.value = JSON.stringify(parsed, null, 2);
                        this.showStatus(statusDiv, 'JSON格式化成功！', 'success');
                    } catch (error) {
                        this.showStatus(statusDiv, `JSON格式错误: ${error.message}`, 'error');
                    }
                }
            },
            {
                id: 'minifyJson',
                handler: () => {
                    try {
                        const parsed = JSON.parse(jsonInput.value);
                        jsonResult.value = JSON.stringify(parsed);
                        this.showStatus(statusDiv, 'JSON压缩成功！', 'success');
                    } catch (error) {
                        this.showStatus(statusDiv, `JSON格式错误: ${error.message}`, 'error');
                    }
                }
            },
            {
                id: 'validateJson',
                handler: () => {
                    try {
                        JSON.parse(jsonInput.value);
                        this.showStatus(statusDiv, 'JSON格式正确！', 'success');
                    } catch (error) {
                        this.showStatus(statusDiv, `JSON格式错误: ${error.message}`, 'error');
                    }
                }
            },
            {
                id: 'copyJson',
                handler: () => {
                    this.copyToClipboard(jsonResult.value, this.$('copyJson'));
                }
            }
        ];

        this.bindButtonEvents(buttonConfigs);
    }

    // Base64编码/解码
    initBase64Encoder() {
        const input = this.$('base64Input');
        const output = this.$('base64Output');

        const buttonConfigs = [
            {
                id: 'encodeBase64',
                handler: () => {
                    try {
                        output.value = btoa(unescape(encodeURIComponent(input.value)));
                    } catch (error) {
                        output.value = '编码失败: ' + error.message;
                    }
                }
            },
            {
                id: 'decodeBase64',
                handler: () => {
                    try {
                        output.value = decodeURIComponent(escape(atob(input.value)));
                    } catch (error) {
                        output.value = '解码失败: ' + error.message;
                    }
                }
            },
            {
                id: 'copyBase64Output',
                handler: () => {
                    this.copyToClipboard(output.value, this.$('copyBase64Output'));
                }
            }
        ];

        this.bindButtonEvents(buttonConfigs);
    }





    // 二维码生成
    initQRGenerator() {
        const input = this.$('qrInput');
        const generateBtn = this.$('generateQR');
        const downloadBtn = this.$('downloadQR');
        const canvas = this.$('qrCanvas');

        generateBtn.addEventListener('click', () => {
            if (!input.value.trim()) {
                alert('请输入要生成二维码的内容');
                return;
            }

            QRCode.toCanvas(canvas, input.value, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    console.error('二维码生成失败:', error);
                    alert('二维码生成失败');
                }
            });
        });

        downloadBtn.addEventListener('click', () => {
            if (!input.value.trim()) {
                alert('请先生成二维码');
                return;
            }

            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    // 工具方法
    
    // 通用事件绑定方法
    bindButtonEvents(buttonConfigs) {
        buttonConfigs.forEach(config => {
            const button = this.$(config.id);
            if (button) {
                button.addEventListener('click', config.handler);
            }
        });
    }

    copyToClipboard(text, button) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopySuccess(button);
            }).catch(() => {
                this.fallbackCopy(text, button);
            });
        } else {
            this.fallbackCopy(text, button);
        }
    }

    fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess(button);
        } catch (err) {
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess(button) {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }

    showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-message ${type}`;
        
        setTimeout(() => {
            element.textContent = '';
            element.className = 'status-message';
        }, 3000);
    }

    // 密码生成器
    initPasswordGenerator() {
        const generateBtn = this.$('generatePassword');
        const generateMultipleBtn = this.$('generateMultiple');
        const copyBtn = this.$('copyPassword');
        const result = this.$('passwordResult');

        generateBtn.addEventListener('click', () => {
            const password = this.generatePassword();
            result.value = password;
        });

        generateMultipleBtn.addEventListener('click', () => {
            const count = 5;
            const passwords = [];
            for (let i = 0; i < count; i++) {
                passwords.push(this.generatePassword());
            }
            result.value = passwords.join('\n');
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(result.value, copyBtn);
        });
    }



    // 正则表达式测试器
    initRegexTester() {
        const testBtn = this.$('testRegex');
        const replaceBtn = this.$('replaceRegex');
        const copyBtn = this.$('copyRegex');
        const result = this.$('regexResult');

        testBtn.addEventListener('click', () => {
            const pattern = this.$('regexPattern').value;
            const text = this.$('regexText').value;
            
            try {
                const regex = new RegExp(pattern.replace(/^\/|\/[gimuy]*$/g, ''), pattern.match(/[gimuy]*$/)?.[0] || '');
                const matches = text.match(regex);
                
                if (matches) {
                    result.value = `匹配到 ${matches.length} 个结果:\n${matches.join('\n')}`;
                } else {
                    result.value = '没有找到匹配项';
                }
            } catch (error) {
                result.value = `正则表达式错误: ${error.message}`;
            }
        });

        replaceBtn.addEventListener('click', () => {
            const pattern = this.$('regexPattern').value;
            const text = this.$('regexText').value;
            const replaceText = this.$('replaceText').value;
            
            try {
                const regex = new RegExp(pattern.replace(/^\/|\/[gimuy]*$/g, ''), pattern.match(/[gimuy]*$/)?.[0] || '');
                const replaced = text.replace(regex, replaceText);
                result.value = replaced;
            } catch (error) {
                result.value = `替换失败: ${error.message}`;
            }
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(result.value, copyBtn);
        });
    }



    // 哈希计算器
    initHashCalculator() {
        const calculateBtn = this.$('calculateHash');
        const calculateAllBtn = this.$('calculateAllHashes');
        const copyBtn = this.$('copyHash');
        const result = this.$('hashResult');

        calculateBtn.addEventListener('click', () => {
            const text = this.$('hashInput').value;
            const algorithm = this.$('hashAlgorithm').value;
            
            if (typeof CryptoJS !== 'undefined') {
                let hash;
                switch (algorithm) {
                    case 'md5':
                        hash = CryptoJS.MD5(text).toString();
                        break;
                    case 'sha1':
                        hash = CryptoJS.SHA1(text).toString();
                        break;
                    case 'sha256':
                        hash = CryptoJS.SHA256(text).toString();
                        break;
                    case 'sha512':
                        hash = CryptoJS.SHA512(text).toString();
                        break;
                }
                result.value = hash;
            } else {
                result.value = '加密库未加载';
            }
        });

        calculateAllBtn.addEventListener('click', () => {
            const text = this.$('hashInput').value;
            
            if (typeof CryptoJS !== 'undefined') {
                const md5 = CryptoJS.MD5(text).toString();
                const sha1 = CryptoJS.SHA1(text).toString();
                const sha256 = CryptoJS.SHA256(text).toString();
                const sha512 = CryptoJS.SHA512(text).toString();
                
                result.value = `MD5: ${md5}\nSHA-1: ${sha1}\nSHA-256: ${sha256}\nSHA-512: ${sha512}`;
            } else {
                result.value = '加密库未加载';
            }
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(result.value, copyBtn);
        });
    }





    // 进制转换器
    initNumberConverter() {
        const convertBtn = this.$('convertNumber');
        const convertAllBtn = this.$('convertAllBases');
        const copyBtn = this.$('copyNumber');
        const result = this.$('numberResult');

        convertBtn.addEventListener('click', () => {
            const input = this.$('numberInput').value.trim();
            const fromBase = parseInt(this.$('fromBase').value);
            const toBase = parseInt(this.$('toBase').value);
            
            try {
                const decimal = parseInt(input, fromBase);
                if (isNaN(decimal)) {
                    result.value = '输入的数字格式不正确';
                    return;
                }
                
                const converted = decimal.toString(toBase);
                result.value = `${input} (${fromBase}进制) = ${converted} (${toBase}进制)`;
            } catch (error) {
                result.value = `转换失败: ${error.message}`;
            }
        });

        convertAllBtn.addEventListener('click', () => {
            const input = this.$('numberInput').value.trim();
            const fromBase = parseInt(this.$('fromBase').value);
            
            try {
                const decimal = parseInt(input, fromBase);
                if (isNaN(decimal)) {
                    result.value = '输入的数字格式不正确';
                    return;
                }
                
                const binary = decimal.toString(2);
                const octal = decimal.toString(8);
                const hex = decimal.toString(16).toUpperCase();
                
                result.value = `原始: ${input} (${fromBase}进制)\n二进制: ${binary}\n八进制: ${octal}\n十进制: ${decimal}\n十六进制: ${hex}`;
            } catch (error) {
                result.value = `转换失败: ${error.message}`;
            }
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(result.value, copyBtn);
        });
    }

    // 工具方法
    generatePassword() {
        const length = parseInt(this.$('passwordLength').value) || 12;
        const includeUppercase = this.$('includeUppercase').checked;
        const includeLowercase = this.$('includeLowercase').checked;
        const includeNumbers = this.$('includeNumbers').checked;
        const includeSymbols = this.$('includeSymbols').checked;
        
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!charset) {
            return '请至少选择一种字符类型';
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }

    // 字段名称翻译器
    initFieldTranslator() {
        const fieldInput = this.$('fieldInput');
        const fieldResult = this.$('fieldResult');
        const copyFieldBtn = this.$('copyField');
        const translateToEnglishBtn = this.$('translateToEnglish');
        const translateToChineseBtn = this.$('translateToChinese');
        const suggestVariantsBtn = this.$('suggestVariants');
        const fieldSuggestions = this.$('fieldSuggestions');

        // 翻译API配置
        this.translationConfig = {
            // Google翻译 (通过MyMemory API，免费稳定)
            googleTranslate: {
                enabled: true
            },
            // LibreTranslate (免费开源，可自托管)
            libreTranslate: {
                url: 'https://libretranslate.de/translate',
                enabled: false
            },
            // 百度翻译API (需要申请免费额度)
            baidu: {
                appId: '', // 用户需要自己申请
                secretKey: '', // 用户需要自己申请
                enabled: false
            }
        };

        // 加载用户配置
        this.loadTranslationConfig();

        // 初始化API配置界面
        this.initApiConfig();

        // 翻译为英文
        translateToEnglishBtn.addEventListener('click', async () => {
            const input = fieldInput.value.trim();
            if (!input) {
                this.showMessage('请输入要翻译的字段名称', 'warning');
                return;
            }

            this.setLoading(translateToEnglishBtn, true);
            try {
                const result = await this.translateField(input, 'zh', 'en');
                fieldResult.value = result;
                this.showMessage('翻译完成！', 'success');
            } catch (error) {
                this.showMessage(`翻译失败: ${error.message}`, 'error');
            } finally {
                this.setLoading(translateToEnglishBtn, false);
            }
        });

        // 翻译为中文
        translateToChineseBtn.addEventListener('click', async () => {
            const input = fieldInput.value.trim();
            if (!input) {
                this.showMessage('请输入要翻译的字段名称', 'warning');
                return;
            }

            this.setLoading(translateToChineseBtn, true);
            try {
                const result = await this.translateField(input, 'en', 'zh');
                fieldResult.value = result;
                this.showMessage('翻译完成！', 'success');
            } catch (error) {
                this.showMessage(`翻译失败: ${error.message}`, 'error');
            } finally {
                this.setLoading(translateToChineseBtn, false);
            }
        });

        // 建议变体
        suggestVariantsBtn.addEventListener('click', async () => {
            const input = fieldInput.value.trim();
            if (!input) {
                this.showMessage('请输入要查询的字段名称', 'warning');
                return;
            }

            this.setLoading(suggestVariantsBtn, true);
            try {
                const variants = await this.generateFieldVariants(input);
                fieldResult.value = variants;
                this.showMessage('变体建议生成完成！', 'success');
            } catch (error) {
                this.showMessage(`生成变体失败: ${error.message}`, 'error');
            } finally {
                this.setLoading(suggestVariantsBtn, false);
            }
        });

        // 复制结果
        copyFieldBtn.addEventListener('click', () => {
            if (fieldResult.value) {
                navigator.clipboard.writeText(fieldResult.value).then(() => {
                    this.showMessage('已复制到剪贴板！', 'success');
                });
            } else {
                this.showMessage('没有内容可复制', 'warning');
            }
        });

        // 点击建议项
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                const text = e.target.textContent.split(' → ')[0];
                fieldInput.value = text;
                fieldSuggestions.style.display = 'none';
            }
        });

        // 显示/隐藏建议
        const toggleSuggestions = () => {
            fieldSuggestions.style.display = fieldSuggestions.style.display === 'none' ? 'block' : 'none';
        };

        // 添加切换建议的按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.textContent === '建议变体' && e.target.id === 'suggestVariants') {
                // 如果输入框为空，显示建议
                if (!fieldInput.value.trim()) {
                    toggleSuggestions();
                }
            }
        });
    }

    // 加载翻译配置
    loadTranslationConfig() {
        const saved = localStorage.getItem('translationConfig');
        if (saved) {
            this.translationConfig = { ...this.translationConfig, ...JSON.parse(saved) };
        }
    }

    // 初始化API配置界面
    initApiConfig() {
        const googleTranslateEnabled = this.$('googleTranslateEnabled');
        const libreTranslateEnabled = this.$('libreTranslateEnabled');
        const baiduTranslateEnabled = this.$('baiduTranslateEnabled');
        const baiduKeys = this.$('baiduKeys');
        const baiduAppId = this.$('baiduAppId');
        const baiduSecretKey = this.$('baiduSecretKey');
        const saveBaiduConfig = this.$('saveBaiduConfig');

        // 如果当前页面未包含翻译配置相关的控件，则跳过初始化，避免空引用错误
        if (
            !googleTranslateEnabled ||
            !libreTranslateEnabled ||
            !baiduTranslateEnabled ||
            !baiduKeys ||
            !baiduAppId ||
            !baiduSecretKey ||
            !saveBaiduConfig
        ) {
            console.warn('未在页面中找到翻译配置相关的控件，已跳过 initApiConfig() 初始化。');
            return;
        }

        // 设置初始状态
        googleTranslateEnabled.checked = this.translationConfig.googleTranslate.enabled;
        libreTranslateEnabled.checked = this.translationConfig.libreTranslate.enabled;
        baiduTranslateEnabled.checked = this.translationConfig.baidu.enabled;
        baiduAppId.value = this.translationConfig.baidu.appId;
        baiduSecretKey.value = this.translationConfig.baidu.secretKey;

        // 显示/隐藏百度API密钥输入框
        if (baiduTranslateEnabled.checked) {
            baiduKeys.style.display = 'flex';
        }

        // Google翻译开关
        googleTranslateEnabled.addEventListener('change', (e) => {
            this.translationConfig.googleTranslate.enabled = e.target.checked;
            this.saveTranslationConfig();
        });

        // LibreTranslate开关
        libreTranslateEnabled.addEventListener('change', (e) => {
            this.translationConfig.libreTranslate.enabled = e.target.checked;
            this.saveTranslationConfig();
        });

        // 百度翻译开关
        baiduTranslateEnabled.addEventListener('change', (e) => {
            this.translationConfig.baidu.enabled = e.target.checked;
            baiduKeys.style.display = e.target.checked ? 'flex' : 'none';
            this.saveTranslationConfig();
        });

        // 保存百度配置
        saveBaiduConfig.addEventListener('click', () => {
            const appId = baiduAppId.value.trim();
            const secretKey = baiduSecretKey.value.trim();

            if (!appId || !secretKey) {
                this.showMessage('请填写完整的App ID和Secret Key', 'warning');
                return;
            }

            this.translationConfig.baidu.appId = appId;
            this.translationConfig.baidu.secretKey = secretKey;
            this.saveTranslationConfig();
            this.showMessage('百度翻译配置已保存！', 'success');
        });
    }

    // 保存翻译配置
    saveTranslationConfig() {
        localStorage.setItem('translationConfig', JSON.stringify(this.translationConfig));
    }

    // 设置按钮加载状态
    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.textContent = '翻译中...';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.textContent = button.getAttribute('data-original-text') || '翻译';
            button.style.opacity = '1';
        }
    }

    // 主要翻译方法
    async translateField(text, from, to) {
        // 首先尝试Google翻译（通过MyMemory API）
        if (this.translationConfig.googleTranslate.enabled) {
            try {
                const result = await this.translateWithGoogle(text, from, to);
                return this.formatFieldName(result, to);
            } catch (error) {
                console.warn('Google Translate failed:', error);
            }
        }

        // 然后尝试LibreTranslate
        if (this.translationConfig.libreTranslate.enabled) {
            try {
                const result = await this.translateWithLibreTranslate(text, from, to);
                return this.formatFieldName(result, to);
            } catch (error) {
                console.warn('LibreTranslate failed:', error);
            }
        }

        // 如果LibreTranslate失败，尝试百度翻译
        if (this.translationConfig.baidu.enabled && this.translationConfig.baidu.appId) {
            try {
                const result = await this.translateWithBaidu(text, from, to);
                return this.formatFieldName(result, to);
            } catch (error) {
                console.warn('Baidu Translate failed:', error);
            }
        }

        // 如果所有API都失败，使用本地智能翻译
        return this.fallbackTranslate(text, from, to);
    }

    // Google翻译（通过MyMemory API）
    async translateWithGoogle(text, from, to) {
        try {
            // 使用MyMemory API作为Google翻译的代理
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            } else {
                throw new Error(data.responseDetails || 'Translation failed');
            }
        } catch (error) {
            console.error('Google Translate error:', error);
            throw error;
        }
    }

    // LibreTranslate翻译（使用可用的实例）
    async translateWithLibreTranslate(text, from, to) {
        // 尝试多个可用的LibreTranslate实例
        const instances = [
            'https://translate.argosopentech.com/translate',
            'https://libretranslate.com/translate',
            'https://libretranslate.de/translate'
        ];

        for (const url of instances) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        source: from,
                        target: to,
                        format: 'text'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.translatedText && data.translatedText !== text) {
                        return data.translatedText;
                    }
                }
            } catch (error) {
                console.log(`LibreTranslate instance ${url} failed:`, error.message);
                continue;
            }
        }

        throw new Error('所有LibreTranslate实例都无法访问，可能是CORS限制');
    }

    // 百度翻译API
    async translateWithBaidu(text, from, to) {
        const { appId, secretKey } = this.translationConfig.baidu;
        const salt = Date.now().toString();
        const sign = this.md5(appId + text + salt + secretKey);

        const params = new URLSearchParams({
            q: text,
            from: from,
            to: to,
            appid: appId,
            salt: salt,
            sign: sign
        });

        const response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error_code) {
            throw new Error(`百度翻译错误: ${data.error_msg}`);
        }

        return data.trans_result[0].dst;
    }

    // 本地智能翻译（备用方案）
    fallbackTranslate(text, from, to) {
        const commonTranslations = {
            // 中文到英文
            'zh-en': {
                '用户': 'user', '名称': 'name', '时间': 'time', '状态': 'status',
                '价格': 'price', '数量': 'quantity', '描述': 'description',
                '创建': 'create', '更新': 'update', '删除': 'delete',
                '是否': 'is', '号': 'number', '码': 'code', 'ID': 'id',
                '邮箱': 'email', '手机': 'phone', '密码': 'password',
                '姓名': 'name', '地址': 'address', '年龄': 'age'
            },
            // 英文到中文
            'en-zh': {
                'user': '用户', 'name': '名称', 'time': '时间', 'status': '状态',
                'price': '价格', 'quantity': '数量', 'description': '描述',
                'create': '创建', 'update': '更新', 'delete': '删除',
                'is': '是否', 'number': '号', 'code': '码', 'id': 'ID',
                'email': '邮箱', 'phone': '手机', 'password': '密码',
                'address': '地址', 'age': '年龄'
            }
        };

        const key = `${from}-${to}`;
        const translations = commonTranslations[key] || {};
        
        let result = text;
        for (const [source, target] of Object.entries(translations)) {
            const regex = new RegExp(source, 'gi');
            result = result.replace(regex, target);
        }

        return result;
    }

    // 格式化字段名称
    formatFieldName(text, targetLang) {
        // 直接返回翻译结果，不进行任何格式化
        return text;
    }

    // 生成字段变体
    async generateFieldVariants(input) {
        const variants = [];
        
        // 检测输入语言
        const isChinese = /[\u4e00-\u9fa5]/.test(input);
        
        if (isChinese) {
            // 中文输入，生成英文变体
            const translated = await this.translateField(input, 'zh', 'en');
            variants.push(`翻译: ${translated}`);
            
            // 生成不同命名风格的变体（直接使用翻译结果，不进行额外处理）
            variants.push(`驼峰命名: ${this.toCamelCase(translated)}`);
            variants.push(`下划线命名: ${this.toSnakeCase(translated)}`);
            variants.push(`全小写: ${translated.toLowerCase().replace(/[^\w]/g, '')}`);
            variants.push(`全大写: ${translated.toUpperCase().replace(/[^\w]/g, '')}`);
        } else {
            // 英文输入，生成中文翻译和不同风格
            const translated = await this.translateField(input, 'en', 'zh');
            variants.push(`翻译: ${translated}`);
            
            // 生成不同命名风格的变体（直接使用输入，不进行额外处理）
            variants.push(`驼峰命名: ${this.toCamelCase(input)}`);
            variants.push(`下划线命名: ${this.toSnakeCase(input)}`);
            variants.push(`全小写: ${input.toLowerCase().replace(/[^\w]/g, '')}`);
            variants.push(`全大写: ${input.toUpperCase().replace(/[^\w]/g, '')}`);
        }
        
        return variants.join('\n');
    }

    // 转换为驼峰命名
    toCamelCase(str) {
        if (!str || typeof str !== 'string') {
            return str;
        }
        
        // 先处理空格和特殊字符，然后转换为驼峰命名
        return str
            .trim()
            .replace(/[^\w\s]/g, '') // 移除特殊字符，只保留字母、数字和空格
            .replace(/\s+/g, ' ') // 将多个空格合并为单个空格
            .split(' ')
            .filter(word => word.length > 0) // 过滤空字符串
            .map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
            })
            .join('');
    }

    // 转换为下划线命名
    toSnakeCase(str, options = {}) {
        if (!str || typeof str !== 'string') {
            return str;
        }

        // 如果包含空格，先按空格分割处理
        if (/\s/.test(str)) {
            return str
                .trim()
                .replace(/[^\w\s]/g, '') // 移除特殊字符
                .replace(/\s+/g, ' ') // 合并多个空格
                .split(' ')
                .filter(word => word.length > 0)
                .join('_')
                .toLowerCase();
        }

        // 如果已经是驼峰命名，使用正确的转换方法
        if (/[A-Z]/.test(str)) {
            // 处理连续大写字母的情况，如 XMLHttpRequest -> xml_http_request
            return str
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')  // XMLHttp -> XML_Http
                .replace(/([a-z\d])([A-Z])/g, '$1_$2')       // aB -> a_B
                .toLowerCase();
        }

        // 如果是全小写，根据选项处理
        if (options.handleLowercase === 'keep') {
            // 保持原样
            return str;
        } else if (options.handleLowercase === 'split') {
            // 尝试智能分割（使用简单的启发式规则）
            return this.smartSplit(str);
        } else if (options.handleLowercase === 'ask') {
            // 返回提示信息
            return `[需要处理全小写字符串: ${str}] 请选择处理方式`;
        }

        // 默认行为：保持原样
        return str;
    }

    // 智能分割全小写字符串
    smartSplit(str) {
        // 简单的启发式分割规则
        let result = str.toLowerCase();

        // 规则1: 在连续辅音后插入下划线
        result = result.replace(/([bcdfghjklmnpqrstvwxyz]{2,})([aeiou])/g, '_$1$2');

        // 规则2: 在常见单词边界处分割（但只针对一些非常常见的）
        const veryCommonWords = ['data', 'user', 'name', 'id', 'type', 'status'];
        for (const word of veryCommonWords) {
            if (result.includes(word)) {
                result = result.replace(new RegExp(word, 'gi'), '_' + word);
            }
        }

        // 清理结果
        return result
            .replace(/^_/, '')
            .replace(/_+/g, '_')
            .replace(/_$/, '');
    }

    // MD5哈希函数（用于百度翻译API签名）
    md5(string) {
        function md5cycle(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];
            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);
            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);
            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);
            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);
            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);
        }
        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }
        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }
        function md51(s) {
            var n = s.length,
                state = [1732584193, -271733879, -1732584194, 271733878], i;
            for (i = 64; i <= s.length; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)));
            }
            s = s.substring(i - 64);
            var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < s.length; i++)
                tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
            tail[i >> 2] |= 0x80 << ((i % 4) << 3);
            if (i > 55) {
                md5cycle(state, tail);
                for (i = 0; i < 16; i++) tail[i] = 0;
            }
            tail[14] = n * 8;
            md5cycle(state, tail);
            return state;
        }
        function md5blk(s) {
            var md5blks = [], i;
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i)
                    + (s.charCodeAt(i + 1) << 8)
                    + (s.charCodeAt(i + 2) << 16)
                    + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }
        var hex_chr = '0123456789abcdef'.split('');
        function rhex(n) {
            var s = '', j = 0;
            for (; j < 4; j++)
                s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                    + hex_chr[(n >> (j * 8)) & 0x0F];
            return s;
        }
        function hex(x) {
            for (var i = 0; i < x.length; i++)
                x[i] = rhex(x[i]);
            return x.join('');
        }
        function add32(a, b) {
            return (a + b) & 0xFFFFFFFF;
        }
        return hex(md51(string));
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 3秒后移除
        setTimeout(() => {
            messageEl.classList.add('fade-out');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }


}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new FrontendTools();
});
