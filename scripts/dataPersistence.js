// dataPersistence.js - Data persistence layer for game state and user management

/**
 * Storage keys for different data types
 */
const STORAGE_KEYS = {
    GAME_STATE: 'tab_game_state',
    USER_DATA: 'tab_user_data',
    GAME_HISTORY: 'tab_game_history',
    SETTINGS: 'tab_settings'
};

/**
 * User data management
 */
const UserManager = {
    /**
     * Save user data to localStorage
     * @param {Object} userData - User information (username, password hash, stats, etc.)
     */
    saveUser: function(userData) {
        try {
            const users = this.getAllUsers();
            const existingIndex = users.findIndex(u => u.username === userData.username);
            
            if (existingIndex >= 0) {
                users[existingIndex] = { ...users[existingIndex], ...userData };
            } else {
                users.push(userData);
            }
            
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    },

    /**
     * Get all users from localStorage
     * @returns {Array} Array of user objects
     */
    getAllUsers: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    },

    /**
     * Get user by username
     * @param {string} username
     * @returns {Object|null} User object or null if not found
     */
    getUser: function(username) {
        const users = this.getAllUsers();
        return users.find(u => u.username === username) || null;
    },

    /**
     * Authenticate user
     * @param {string} username
     * @param {string} password
     * @returns {Object|null} User object if authenticated, null otherwise
     */
    authenticate: function(username, password) {
        const user = this.getUser(username);
        if (user && user.password === password) {
            return user;
        }
        return null;
    },

    /**
     * Update user statistics
     * @param {string} username
     * @param {Object} stats - Statistics to update (wins, losses, games_played, etc.)
     */
    updateStats: function(username, stats) {
        const user = this.getUser(username);
        if (user) {
            user.stats = { ...user.stats, ...stats };
            this.saveUser(user);
        }
    }
};

/**
 * Game state management
 */
const GameStateManager = {
    /**
     * Save current game state
     * @param {Object} gameState - Complete game state object
     * @returns {boolean} Success status
     */
    saveGameState: function(gameState) {
        try {
            const stateToSave = {
                ...gameState,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.error('Error saving game state:', error);
            return false;
        }
    },

    /**
     * Load saved game state
     * @returns {Object|null} Game state object or null if no saved state
     */
    loadGameState: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
            if (data) {
                const state = JSON.parse(data);
                return state;
            }
            return null;
        } catch (error) {
            console.error('Error loading game state:', error);
            return null;
        }
    },

    /**
     * Check if there's a saved game
     * @returns {boolean}
     */
    hasSavedGame: function() {
        return localStorage.getItem(STORAGE_KEYS.GAME_STATE) !== null;
    },

    /**
     * Clear saved game state
     */
    clearGameState: function() {
        localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    },

    /**
     * Auto-save game state (throttled to prevent excessive saves)
     */
    autoSave: (function() {
        let timeout = null;
        return function(gameState) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                GameStateManager.saveGameState(gameState);
            }, 2000); // Save after 2 seconds of inactivity
        };
    })()
};

/**
 * Game history management
 */
const GameHistoryManager = {
    /**
     * Add a completed game to history
     * @param {Object} gameData - Completed game data
     */
    addGameToHistory: function(gameData) {
        try {
            const history = this.getHistory();
            const gameRecord = {
                ...gameData,
                completedAt: new Date().toISOString(),
                id: Date.now()
            };
            
            history.unshift(gameRecord); // Add to beginning
            
            // Keep only last 50 games
            if (history.length > 50) {
                history.length = 50;
            }
            
            localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving game history:', error);
        }
    },

    /**
     * Get game history
     * @returns {Array} Array of completed games
     */
    getHistory: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading game history:', error);
            return [];
        }
    },

    /**
     * Clear game history
     */
    clearHistory: function() {
        localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    }
};

/**
 * Settings management
 */
const SettingsManager = {
    /**
     * Save user settings
     * @param {Object} settings
     */
    saveSettings: function(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    /**
     * Load user settings
     * @returns {Object} Settings object with defaults
     */
    loadSettings: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            const defaults = {
                soundEnabled: true,
                autoSave: true,
                difficulty: 'medium'
            };
            
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                soundEnabled: true,
                autoSave: true,
                difficulty: 'medium'
            };
        }
    }
};

/**
 * Export for use in other scripts
 */
if (typeof window !== 'undefined') {
    window.DataPersistence = {
        UserManager,
        GameStateManager,
        GameHistoryManager,
        SettingsManager,
        STORAGE_KEYS
    };
}
