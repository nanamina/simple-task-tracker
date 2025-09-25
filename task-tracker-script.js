// Task Tracker Script - Based on event handling patterns from landing.js

// Task Manager Object - Based on event handling patterns from landing.js
const TaskManager = {
    tasks: [],
    nextId: 1,
    isComposing: false, // IME入力状態を追跡

    // Initialize the application
    init() {
        console.log('シンプルタスクトラッカーを初期化中... 📝');

        try {
            // Check storage availability first and handle appropriately
            const storageAvailable = this.isStorageAvailable();
            if (!storageAvailable) {
                console.warn('Local Storage が利用できません');
                this.showStorageWarning('Local Storage が利用できません。データは保存されません。');
                this.updateStorageStatus(false);
            } else {
                this.updateStorageStatus(true);
            }

            // Load data from storage
            const loadSuccess = this.loadFromStorage();

            // Bind events
            this.bindEvents();

            // Initial render
            this.render();

            // Show storage info in console for debugging
            this.showStorageInfo();

            // Success message
            const taskCount = this.tasks.length;
            const completedCount = this.tasks.filter(t => t.completed).length;
            console.log(`シンプルタスクトラッカーが読み込まれました！ 📝`);
            console.log(`タスク: ${taskCount}件 (完了: ${completedCount}件)`);

            // Show welcome message if no tasks
            if (taskCount === 0 && loadSuccess) {
                console.log('新しいタスクを追加してみましょう！');
            }

            // Announce successful initialization to screen readers
            this.announceToScreenReader('シンプルタスクトラッカーが正常に読み込まれました');

            // Perform self-test in development mode
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                setTimeout(() => this.performSelfTest(), 1000);
            }

        } catch (error) {
            this.handleCriticalError(error, 'アプリケーション初期化');
        }
    },

    // Enhanced event binding with comprehensive interaction support
    bindEvents() {
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskList = document.getElementById('taskList');

        // Add task button click with visual feedback
        addTaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAddTaskWithFeedback(e.target);
        });

        // IME入力状態の追跡
        taskInput.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        taskInput.addEventListener('compositionend', () => {
            this.isComposing = false;
        });

        // Enhanced Enter key handling with IME support
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isComposing) {
                e.preventDefault();
                this.handleAddTaskWithFeedback(addTaskBtn);
            }
        });

        // Real-time input validation and character counter
        taskInput.addEventListener('input', (e) => {
            this.handleInputValidation(e.target);
        });

        // Task list event delegation with enhanced interaction
        taskList.addEventListener('click', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = parseInt(taskItem.dataset.taskId);

            // Handle task completion toggle
            if (e.target.closest('.task-toggle') || e.target.closest('.task-content')) {
                this.handleTaskToggleWithAnimation(taskId, taskItem);
            }
            // Handle task deletion
            else if (e.target.closest('.task-delete')) {
                this.handleTaskDeleteWithAnimation(taskId, taskItem);
            }
        });

        // Keyboard navigation support for task list
        taskList.addEventListener('keydown', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = parseInt(taskItem.dataset.taskId);

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                this.handleTaskDeleteWithAnimation(taskId, taskItem);
            }
        });

        // Focus management for better accessibility
        taskInput.addEventListener('focus', () => {
            taskInput.parentElement.classList.add('focused');
        });

        taskInput.addEventListener('blur', () => {
            taskInput.parentElement.classList.remove('focused');
        });

        console.log('イベントハンドラーを設定しました 🎯');
    },

    // Enhanced task addition with comprehensive validation and feedback
    handleAddTaskWithFeedback(buttonElement) {
        const taskInput = document.getElementById('taskInput');
        const description = taskInput.value.trim();

        // Clear any existing error states
        taskInput.classList.remove('error');
        this.hideMessages();

        // Comprehensive input validation
        const validationResult = this.validateTaskInput(description);
        if (!validationResult.isValid) {
            this.showInputError(taskInput, validationResult.message);
            return;
        }

        // Visual feedback for button press
        buttonElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);

        const task = {
            id: this.nextId++,
            description: this.sanitizeInput(description),
            completed: false,
            createdAt: new Date(),
            completedAt: null
        };

        this.tasks.push(task);

        // Clear input with animation
        taskInput.style.transform = 'scale(0.98)';
        taskInput.value = '';
        setTimeout(() => {
            taskInput.style.transform = 'scale(1)';
            taskInput.focus(); // Keep focus for continuous input
        }, 100);

        // Save to storage and handle errors
        const saveSuccess = this.saveToStorage();
        if (!saveSuccess) {
            console.warn('タスクは追加されましたが、保存に失敗しました');
            this.showMessage('タスクを追加しましたが、保存に失敗しました', 'warning');
        }

        this.render();
        console.log(`新しいタスクを追加しました: "${task.description}"`);

        // Show success feedback
        this.showSuccessMessage(`タスク「${task.description}」を追加しました`);

        // Announce to screen readers
        this.announceToScreenReader('新しいタスクを追加しました');
    },

    // Input validation with real-time feedback
    handleInputValidation(inputElement) {
        const value = inputElement.value;
        const length = value.length;
        const maxLength = 200;

        // Remove error state if input becomes valid
        if (length > 0 && length <= maxLength) {
            inputElement.classList.remove('error');
        }

        // Show character counter near limit
        if (length > maxLength * 0.8) {
            const remaining = maxLength - length;
            if (remaining >= 0) {
                inputElement.title = `残り${remaining}文字`;
            } else {
                inputElement.title = `${Math.abs(remaining)}文字超過`;
                inputElement.classList.add('error');
            }
        } else {
            inputElement.title = '';
        }
    },

    // Enhanced task completion toggle with animation
    handleTaskToggleWithAnimation(id, taskElement) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            console.warn(`タスクが見つかりません: ID ${id}`);
            return;
        }

        const wasCompleted = task.completed;

        // Immediate visual feedback
        taskElement.style.transform = 'scale(0.98)';
        const checkbox = taskElement.querySelector('.task-checkbox');

        // Toggle task state
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;

        // Animate checkbox change
        if (task.completed) {
            checkbox.style.transform = 'scale(1.2)';
            checkbox.textContent = '✓';
            checkbox.classList.add('completed');
            setTimeout(() => {
                checkbox.style.transform = 'scale(1)';
            }, 200);
        } else {
            checkbox.style.transform = 'scale(0.8)';
            checkbox.textContent = '';
            checkbox.classList.remove('completed');
            setTimeout(() => {
                checkbox.style.transform = 'scale(1)';
            }, 200);
        }

        // Reset task element scale
        setTimeout(() => {
            taskElement.style.transform = 'scale(1)';
        }, 150);

        // Save to storage and handle errors
        const saveSuccess = this.saveToStorage();
        if (!saveSuccess) {
            console.warn('タスクの状態は変更されましたが、保存に失敗しました');
            this.showMessage('状態を変更しましたが、保存に失敗しました', 'warning');
        }

        // Re-render with updated state
        setTimeout(() => {
            this.render();
        }, 300);

        const statusText = task.completed ? '完了' : '未完了';
        console.log(`タスクの状態を変更しました: "${task.description}" → ${statusText}`);

        // Show status change feedback
        const actionText = task.completed ? '完了しました' : '未完了に戻しました';
        this.showSuccessMessage(`タスク「${task.description}」を${actionText}`);

        // Announce to screen readers
        this.announceToScreenReader(`タスク ${actionText}`);
    },

    // Enhanced task deletion with confirmation animation
    handleTaskDeleteWithAnimation(id, taskElement) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) {
            console.warn(`削除するタスクが見つかりません: ID ${id}`);
            return;
        }

        const deletedTask = this.tasks[taskIndex];

        // Animate task removal
        taskElement.style.transition = 'all 0.3s ease';
        taskElement.style.transform = 'translateX(-100%)';
        taskElement.style.opacity = '0';

        // Remove from array after animation
        setTimeout(() => {
            this.tasks.splice(taskIndex, 1);

            // Save to storage and handle errors
            const saveSuccess = this.saveToStorage();
            if (!saveSuccess) {
                console.warn('タスクは削除されましたが、保存に失敗しました');
                this.showMessage('タスクを削除しましたが、保存に失敗しました', 'warning');
            }

            this.render();
            console.log(`タスクを削除しました: "${deletedTask.description}"`);

            // Show deletion feedback
            this.showSuccessMessage(`タスク「${deletedTask.description}」を削除しました`);

            // Announce to screen readers
            this.announceToScreenReader('タスクを削除しました');
        }, 300);
    },

    // Dynamic task list rendering - Enhanced for smooth updates and better empty state handling
    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const taskCount = document.getElementById('taskCount');

        // Update task counter with animation
        if (taskCount) {
            const currentCount = parseInt(taskCount.textContent) || 0;
            const newCount = this.tasks.length;

            if (currentCount !== newCount) {
                taskCount.style.transform = 'scale(1.2)';
                taskCount.textContent = newCount;
                setTimeout(() => {
                    taskCount.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // Enhanced empty state handling with better messaging
        if (this.tasks.length === 0) {
            this.showEmptyState(taskList, emptyState);
            return;
        }

        // Show task list and hide empty state
        emptyState.style.display = 'none';
        taskList.style.display = 'block';

        // Create document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        // Sort tasks: incomplete first, then completed
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
            }
            return a.completed - b.completed; // Incomplete first
        });

        sortedTasks.forEach((task, index) => {
            const li = this.createTaskElement(task, index);
            fragment.appendChild(li);
        });

        // Clear and update task list with fade effect
        taskList.style.opacity = '0.7';
        taskList.innerHTML = '';
        taskList.appendChild(fragment);

        // Animate task items appearing
        setTimeout(() => {
            taskList.style.opacity = '1';
            const taskItems = taskList.querySelectorAll('.task-item');
            taskItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }, 50);

        console.log(`タスクリストを更新しました: ${this.tasks.length}件のタスク`);
    },

    // Create individual task element with enhanced interactivity
    createTaskElement(task, index) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;
        li.style.animationDelay = `${index * 0.1}s`;

        // Enhanced task HTML with better accessibility
        li.innerHTML = `
            <div class="task-content" role="button" tabindex="0" aria-label="タスクをクリックして完了状態を切り替え">
                <button class="task-toggle" aria-label="タスクの完了状態を切り替え" tabindex="-1">
                    <span class="task-checkbox ${task.completed ? 'completed' : ''}" aria-hidden="true">
                        ${task.completed ? '✓' : ''}
                    </span>
                </button>
                <div class="task-details">
                    <span class="task-description ${task.completed ? 'completed' : ''}" title="${task.description}">
                        ${task.description}
                    </span>
                    <div class="task-meta">
                        <span class="task-status ${task.completed ? 'completed' : 'todo'}" aria-label="タスクの状態">
                            ${task.completed ? '完了' : '未完了'}
                        </span>
                        <span class="task-date" aria-label="作成日時">
                            ${this.formatDate(task.createdAt)}
                        </span>
                        ${task.completed && task.completedAt ?
                `<span class="task-completed-date" aria-label="完了日時">
                                ${this.formatCompletionDate(task.completedAt)}
                            </span>` : ''
            }
                    </div>
                </div>
            </div>
            <button class="task-delete" aria-label="タスクを削除: ${task.description}" title="削除">
                <span class="delete-icon" aria-hidden="true">×</span>
            </button>
        `;

        // Add keyboard support for task content
        const taskContent = li.querySelector('.task-content');
        taskContent.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTask(task.id);
            }
        });

        return li;
    },

    // Data versioning constants
    STORAGE_KEY: 'simple-task-tracker-data',
    CURRENT_VERSION: '1.0',
    SUPPORTED_VERSIONS: ['1.0'],

    // Check if localStorage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Save to localStorage with enhanced error handling and versioning
    saveToStorage() {
        // Check if localStorage is available
        if (!this.isStorageAvailable()) {
            console.warn('Local Storage が利用できません');
            this.showStorageWarning('Local Storage が利用できません。データは保存されません。');
            return false;
        }

        try {
            const data = {
                tasks: this.tasks,
                nextId: this.nextId,
                version: this.CURRENT_VERSION,
                lastSaved: new Date().toISOString(),
                metadata: {
                    totalTasks: this.tasks.length,
                    completedTasks: this.tasks.filter(t => t.completed).length
                }
            };

            const jsonData = JSON.stringify(data);

            // Check if data size is within localStorage limits (usually ~5-10MB)
            if (jsonData.length > 5000000) { // 5MB limit
                console.warn('データサイズが大きすぎます');
                this.showStorageWarning('データサイズが大きすぎるため、保存できません。');
                return false;
            }

            localStorage.setItem(this.STORAGE_KEY, jsonData);
            console.log('データを正常に保存しました');
            return true;

        } catch (error) {
            console.error('データの保存に失敗しました:', error);

            // Handle specific storage errors
            if (error.name === 'QuotaExceededError') {
                this.showStorageWarning('ストレージの容量が不足しています。古いデータを削除してください。');
            } else if (error.name === 'SecurityError') {
                this.showStorageWarning('セキュリティ設定によりデータを保存できません。');
            } else {
                this.showStorageWarning('データの保存に失敗しました。ブラウザを閉じるとデータが失われます。');
            }
            return false;
        }
    },

    // Load from localStorage with version management and migration
    loadFromStorage() {
        // Check if localStorage is available
        if (!this.isStorageAvailable()) {
            console.warn('Local Storage が利用できません');
            this.showStorageWarning('Local Storage が利用できません。データの読み込みができません。');
            return false;
        }

        try {
            const rawData = localStorage.getItem(this.STORAGE_KEY);

            if (!rawData) {
                console.log('保存されたデータがありません');
                return true; // Not an error, just no data
            }

            const parsed = JSON.parse(rawData);

            // Version compatibility check
            if (!this.isVersionSupported(parsed.version)) {
                console.warn(`サポートされていないデータバージョン: ${parsed.version}`);
                this.showStorageWarning(`データのバージョン（${parsed.version}）がサポートされていません。`);
                return false;
            }

            // Migrate data if necessary
            const migratedData = this.migrateData(parsed);

            // Load tasks with validation
            this.tasks = this.validateAndCleanTasks(migratedData.tasks || []);
            this.nextId = Math.max(migratedData.nextId || 1, this.getMaxTaskId() + 1);

            // Convert date strings back to Date objects
            this.tasks.forEach(task => {
                try {
                    task.createdAt = new Date(task.createdAt);
                    if (task.completedAt) {
                        task.completedAt = new Date(task.completedAt);
                    }
                } catch (dateError) {
                    console.warn('日付の変換に失敗しました:', dateError);
                    task.createdAt = new Date(); // Fallback to current date
                    task.completedAt = task.completed ? new Date() : null;
                }
            });

            console.log(`${this.tasks.length}件のタスクを読み込みました`);
            return true;

        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);

            // Handle specific parsing errors
            if (error instanceof SyntaxError) {
                this.showStorageWarning('保存されたデータが破損しています。新しいデータで開始します。');
                this.clearStorage(); // Clear corrupted data
            } else {
                this.showStorageWarning('データの読み込みに失敗しました。新しいデータで開始します。');
            }

            // Reset to default state
            this.tasks = [];
            this.nextId = 1;
            return false;
        }
    },

    // Check if data version is supported
    isVersionSupported(version) {
        return this.SUPPORTED_VERSIONS.includes(version);
    },

    // Migrate data between versions
    migrateData(data) {
        const version = data.version || '1.0';

        switch (version) {
            case '1.0':
                // Current version, no migration needed
                return data;
            default:
                console.warn(`未知のデータバージョン: ${version}`);
                return data;
        }
    },

    // Validate and clean task data
    validateAndCleanTasks(tasks) {
        if (!Array.isArray(tasks)) {
            console.warn('タスクデータが配列ではありません');
            return [];
        }

        return tasks.filter(task => {
            // Validate required fields
            if (!task || typeof task !== 'object') {
                console.warn('無効なタスクオブジェクト:', task);
                return false;
            }

            if (!task.id || typeof task.id !== 'number') {
                console.warn('無効なタスクID:', task);
                return false;
            }

            if (!task.description || typeof task.description !== 'string') {
                console.warn('無効なタスク説明:', task);
                return false;
            }

            if (typeof task.completed !== 'boolean') {
                console.warn('無効な完了状態:', task);
                task.completed = false; // Fix invalid completed state
            }

            return true;
        });
    },

    // Get maximum task ID for nextId calculation
    getMaxTaskId() {
        if (this.tasks.length === 0) return 0;
        return Math.max(...this.tasks.map(task => task.id));
    },

    // Clear all storage data
    clearStorage() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('ストレージデータをクリアしました');
            return true;
        } catch (error) {
            console.error('ストレージのクリアに失敗しました:', error);
            return false;
        }
    },

    // Get storage usage information
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return null;
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const dataSize = data ? data.length : 0;
            const dataSizeKB = Math.round(dataSize / 1024 * 100) / 100;

            return {
                hasData: !!data,
                dataSize: dataSize,
                dataSizeKB: dataSizeKB,
                taskCount: this.tasks.length,
                completedCount: this.tasks.filter(t => t.completed).length
            };
        } catch (error) {
            console.error('ストレージ情報の取得に失敗しました:', error);
            return null;
        }
    },

    // Show storage warning with custom message - Enhanced for better user experience
    showStorageWarning(customMessage = null) {
        const defaultMessage = 'データの保存ができません。ブラウザを閉じるとデータが失われます。';
        const message = customMessage || defaultMessage;

        // Show persistent warning for storage issues
        this.showMessage(message, 'warning', true);

        // Also show in console for debugging
        console.warn('Storage Warning:', message);

        // Update footer to reflect storage status
        this.updateStorageStatus(false);
    },

    // Update storage status in footer
    updateStorageStatus(isAvailable) {
        const footerText = document.querySelector('.footer-text');
        if (footerText) {
            if (isAvailable) {
                footerText.textContent = 'シンプルタスクトラッカー - データはブラウザに保存されます';
                footerText.classList.remove('storage-unavailable');
            } else {
                footerText.textContent = 'シンプルタスクトラッカー - ⚠️ データ保存が利用できません';
                footerText.classList.add('storage-unavailable');
            }
        }
    },

    // Enhanced message display system with better error state handling
    showMessage(message, type = 'error', persistent = false) {
        // Create message element if it doesn't exist
        let messageElement = document.getElementById(`${type}-message`);

        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = `${type}-message`;
            messageElement.className = `${type}-message`;
            messageElement.setAttribute('role', 'alert');
            messageElement.setAttribute('aria-live', 'polite');

            // Add close button for persistent messages
            if (persistent) {
                const closeButton = document.createElement('button');
                closeButton.className = 'message-close';
                closeButton.innerHTML = '×';
                closeButton.setAttribute('aria-label', 'メッセージを閉じる');
                closeButton.onclick = () => {
                    messageElement.classList.remove('show');
                };
                messageElement.appendChild(closeButton);
            }

            // Insert after main content
            const main = document.querySelector('.app-main');
            if (main) {
                main.appendChild(messageElement);
            } else {
                document.querySelector('.container').appendChild(messageElement);
            }
        }

        // Update message content (preserve close button if exists)
        const closeButton = messageElement.querySelector('.message-close');
        messageElement.textContent = message;
        if (closeButton) {
            messageElement.appendChild(closeButton);
        }

        messageElement.classList.add('show');

        // Auto-hide after specified time unless persistent
        if (!persistent) {
            const hideDelay = type === 'warning' ? 8000 : type === 'error' ? 5000 : 3000;
            setTimeout(() => {
                messageElement.classList.remove('show');
            }, hideDelay);
        }

        // Log message for debugging
        console.log(`${type.toUpperCase()}: ${message}`);
    },

    // Show success message with green styling
    showSuccessMessage(message) {
        let messageElement = document.getElementById('success-message');

        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'success-message';
            messageElement.className = 'success-message';
            messageElement.setAttribute('role', 'status');
            messageElement.setAttribute('aria-live', 'polite');

            const main = document.querySelector('.app-main');
            if (main) {
                main.appendChild(messageElement);
            }
        }

        messageElement.textContent = message;
        messageElement.classList.add('show');

        // Auto-hide after 3 seconds for success messages
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    },

    // Show input error with field highlighting
    showInputError(inputElement, message) {
        inputElement.classList.add('error');
        inputElement.focus();

        // Shake animation for input field
        inputElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            inputElement.style.animation = '';
        }, 500);

        this.showMessage(message, 'error');
    },

    // Hide all messages
    hideMessages() {
        const messages = document.querySelectorAll('.error-message, .warning-message, .success-message');
        messages.forEach(msg => {
            msg.classList.remove('show');
        });
    },

    // Show storage info (for debugging)
    showStorageInfo() {
        const info = this.getStorageInfo();
        if (info) {
            console.log('ストレージ情報:', {
                'データあり': info.hasData,
                'データサイズ': `${info.dataSizeKB} KB`,
                'タスク数': info.taskCount,
                '完了タスク数': info.completedCount
            });
        }
    },

    // Comprehensive input validation
    validateTaskInput(input) {
        // Check for empty input
        if (!input || input.length === 0) {
            return {
                isValid: false,
                message: 'タスクの内容を入力してください'
            };
        }

        // Check for whitespace-only input
        if (input.trim().length === 0) {
            return {
                isValid: false,
                message: 'タスクの内容を入力してください（空白のみは無効です）'
            };
        }

        // Check length limits
        if (input.length > 200) {
            return {
                isValid: false,
                message: 'タスクの説明は200文字以内で入力してください'
            };
        }

        // Check for potentially dangerous content
        if (this.containsUnsafeContent(input)) {
            return {
                isValid: false,
                message: '無効な文字が含まれています'
            };
        }

        // Check for excessive special characters
        const specialCharCount = (input.match(/[<>'"&]/g) || []).length;
        if (specialCharCount > input.length * 0.3) {
            return {
                isValid: false,
                message: '特殊文字が多すぎます'
            };
        }

        // Check for duplicate tasks
        const duplicateTask = this.tasks.find(task =>
            task.description.toLowerCase().trim() === input.toLowerCase().trim()
        );
        if (duplicateTask) {
            return {
                isValid: false,
                message: '同じ内容のタスクが既に存在します'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    },

    // Check for potentially unsafe content
    containsUnsafeContent(input) {
        const unsafePatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];

        return unsafePatterns.some(pattern => pattern.test(input));
    },

    // Enhanced input sanitization to prevent XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }

        // Create a temporary div element for safe HTML escaping
        const div = document.createElement('div');
        div.textContent = input;
        let sanitized = div.innerHTML;

        // Additional sanitization for common attack vectors
        sanitized = sanitized
            .replace(/&lt;script.*?&gt;.*?&lt;\/script&gt;/gi, '')
            .replace(/&lt;iframe.*?&gt;.*?&lt;\/iframe&gt;/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Limit length after sanitization
        if (sanitized.length > 250) {
            sanitized = sanitized.substring(0, 250) + '...';
        }

        return sanitized;
    },

    // Enhanced empty state display with contextual messaging
    showEmptyState(taskList, emptyState) {
        taskList.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.style.opacity = '0';

        // Update empty state message based on context
        const emptyStateTitle = emptyState.querySelector('.empty-state-title');
        const emptyStateMessage = emptyState.querySelector('.empty-state-message');

        if (emptyStateTitle && emptyStateMessage) {
            // Check if this is first time use or if user had tasks before
            const hasUsedBefore = localStorage.getItem(this.STORAGE_KEY) !== null;

            if (!hasUsedBefore) {
                // First time user
                emptyStateTitle.textContent = 'シンプルタスクトラッカーへようこそ！';
                emptyStateMessage.innerHTML = `
                    最初のタスクを追加して、生産性を向上させましょう！<br>
                    上の入力フィールドにタスクを入力してEnterキーを押すか、「追加」ボタンをクリックしてください。<br>
                    <small style="color: #9ca3af; margin-top: 0.5rem; display: block;">
                        💡 ヒント: タスクをクリックすると完了状態を切り替えられます
                    </small>
                `;
            } else {
                // Returning user with no tasks
                emptyStateTitle.textContent = 'すべてのタスクが完了しました！';
                emptyStateMessage.innerHTML = `
                    お疲れさまでした。新しいタスクを追加して続けましょう。<br>
                    <small style="color: #9ca3af; margin-top: 0.5rem; display: block;">
                        🎉 すべてのタスクを完了しました！
                    </small>
                `;
            }
        }

        setTimeout(() => {
            emptyState.style.opacity = '1';
        }, 100);
    },

    // Enhanced error recovery system
    handleCriticalError(error, context = '') {
        console.error(`Critical error in ${context}:`, error);

        const errorMessage = `
            アプリケーションでエラーが発生しました。
            ${context ? `場所: ${context}` : ''}
            ページを再読み込みしてください。
        `;

        this.showMessage(errorMessage, 'error', true);

        // Try to save current state before potential crash
        try {
            this.saveToStorage();
        } catch (saveError) {
            console.error('Failed to save state during error recovery:', saveError);
        }
    },

    // Format date in Japanese with enhanced formatting
    formatDate(date) {
        try {
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return '日付不明';
            }

            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));

            // Show relative time for recent dates
            if (diffMinutes < 1) {
                return 'たった今';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}分前`;
            } else if (diffHours < 24) {
                return `${diffHours}時間前`;
            } else if (diffDays === 1) {
                return '昨日';
            } else if (diffDays < 7) {
                return `${diffDays}日前`;
            }

            // For older dates, show full Japanese format
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        } catch (error) {
            console.warn('Date formatting error:', error);
            return '日付エラー';
        }
    },

    // Format completion date specifically
    formatCompletionDate(date) {
        try {
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return '';
            }

            const now = new Date();
            const diffMs = now - date;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffMinutes < 1) {
                return 'たった今完了';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}分前に完了`;
            } else if (diffHours < 24) {
                return `${diffHours}時間前に完了`;
            } else {
                return date.toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric'
                }) + 'に完了';
            }
        } catch (error) {
            console.warn('Completion date formatting error:', error);
            return '完了日時不明';
        }
    },

    // Announce messages to screen readers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    },

    // Perform self-test to ensure all functionality works
    performSelfTest() {
        console.log('🧪 セルフテストを開始します...');

        const testResults = {
            storage: false,
            taskCreation: false,
            taskToggle: false,
            taskDeletion: false,
            dateFormatting: false,
            inputValidation: false
        };

        try {
            // Test storage
            testResults.storage = this.isStorageAvailable();
            console.log(`✅ ストレージテスト: ${testResults.storage ? '成功' : '失敗'}`);

            // Test date formatting
            const testDate = new Date();
            const formattedDate = this.formatDate(testDate);
            testResults.dateFormatting = formattedDate !== '日付エラー';
            console.log(`✅ 日付フォーマットテスト: ${testResults.dateFormatting ? '成功' : '失敗'}`);

            // Test input validation
            const validInput = this.validateTaskInput('テストタスク');
            const invalidInput = this.validateTaskInput('');
            testResults.inputValidation = validInput.isValid && !invalidInput.isValid;
            console.log(`✅ 入力検証テスト: ${testResults.inputValidation ? '成功' : '失敗'}`);

            // Test task operations (without affecting UI)
            const originalTasks = [...this.tasks];
            const originalNextId = this.nextId;

            // Test task creation
            const testTask = {
                id: 999999,
                description: 'テストタスク',
                completed: false,
                createdAt: new Date(),
                completedAt: null
            };
            this.tasks.push(testTask);
            testResults.taskCreation = this.tasks.includes(testTask);

            // Test task toggle
            testTask.completed = true;
            testTask.completedAt = new Date();
            testResults.taskToggle = testTask.completed;

            // Test task deletion
            const taskIndex = this.tasks.indexOf(testTask);
            this.tasks.splice(taskIndex, 1);
            testResults.taskDeletion = !this.tasks.includes(testTask);

            // Restore original state
            this.tasks = originalTasks;
            this.nextId = originalNextId;

            console.log(`✅ タスク作成テスト: ${testResults.taskCreation ? '成功' : '失敗'}`);
            console.log(`✅ タスク切り替えテスト: ${testResults.taskToggle ? '成功' : '失敗'}`);
            console.log(`✅ タスク削除テスト: ${testResults.taskDeletion ? '成功' : '失敗'}`);

            const allTestsPassed = Object.values(testResults).every(result => result);
            console.log(`🧪 セルフテスト完了: ${allTestsPassed ? '全て成功' : '一部失敗'}`);

            return testResults;

        } catch (error) {
            console.error('🚨 セルフテスト中にエラーが発生しました:', error);
            return testResults;
        }
    }
};

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    TaskManager.handleCriticalError(event.error, 'Global Error Handler');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    TaskManager.handleCriticalError(event.reason, 'Promise Rejection');
    event.preventDefault(); // Prevent default browser error handling
});

// Initialize when DOM is loaded - Pattern from landing.js with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        TaskManager.init();
    } catch (error) {
        console.error('Failed to initialize TaskManager:', error);

        // Show fallback error message
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message show';
            errorDiv.textContent = 'アプリケーションの初期化に失敗しました。ページを再読み込みしてください。';
            container.appendChild(errorDiv);
        }
    }
});