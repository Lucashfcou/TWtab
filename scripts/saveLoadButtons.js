// saveLoadButtons.js - Handle manual save/load game functionality

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-game-btn');
    const loadBtn = document.getElementById('load-game-btn');
    const saveIndicator = document.getElementById('save-indicator');
    
    // Save game button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!window.gameLogic) {
                alert('Sistema de jogo não carregado.');
                return;
            }
            
            if (!window.gameLogic.gameState.gameActive) {
                alert('Nenhum jogo ativo para salvar.');
                return;
            }
            
            const success = window.gameLogic.saveGame();
            if (success) {
                // Show save indicator
                if (saveIndicator) {
                    saveIndicator.style.display = 'block';
                    setTimeout(() => {
                        saveIndicator.style.display = 'none';
                    }, 3000);
                }
                
                const messageElement = document.querySelector('.message p');
                if (messageElement) {
                    const currentText = messageElement.textContent;
                    messageElement.textContent = '💾 Jogo salvo com sucesso!';
                    setTimeout(() => {
                        messageElement.textContent = currentText;
                    }, 2000);
                }
            } else {
                alert('Erro ao salvar o jogo.');
            }
        });
    }
    
    // Load game button
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            if (!window.gameLogic) {
                alert('Sistema de jogo não carregado.');
                return;
            }
            
            if (!window.gameLogic.hasSavedGame()) {
                alert('Nenhum jogo salvo encontrado.');
                return;
            }
            
            // Warn if there's an active game
            if (window.gameLogic.gameState.gameActive) {
                if (!confirm('Há um jogo em andamento. Deseja abandoná-lo e carregar o jogo salvo?')) {
                    return;
                }
            }
            
            const success = window.gameLogic.loadGame();
            if (success) {
                // Enable roll button
                const rollBtn = document.getElementById('roll-dice');
                if (rollBtn) {
                    rollBtn.disabled = false;
                }
                
                const messageElement = document.querySelector('.message p');
                if (messageElement) {
                    const currentText = messageElement.textContent;
                    messageElement.textContent = '📂 Jogo carregado com sucesso!';
                    setTimeout(() => {
                        messageElement.textContent = currentText;
                    }, 2000);
                }
            } else {
                alert('Erro ao carregar o jogo.');
            }
        });
    }
    
    // Show auto-save indicator when game state changes
    // Use a setup function that runs after gameLogic is loaded
    function setupAutoSaveIndicator() {
        if (!window.gameLogic || typeof window.gameLogic.autoSaveGame !== 'function') {
            // gameLogic not ready yet, try again after a short delay
            setTimeout(setupAutoSaveIndicator, 100);
            return;
        }
        
        let autoSaveTimeout = null;
        const originalAutoSave = window.gameLogic.autoSaveGame;
        
        window.gameLogic.autoSaveGame = function() {
            // Call original function
            originalAutoSave.apply(this, arguments);
            
            // Show indicator briefly
            if (saveIndicator) {
                if (autoSaveTimeout) {
                    clearTimeout(autoSaveTimeout);
                }
                
                saveIndicator.style.display = 'block';
                autoSaveTimeout = setTimeout(() => {
                    saveIndicator.style.display = 'none';
                }, 2000);
            }
        };
    }
    
    // Start trying to set up the indicator
    setupAutoSaveIndicator();
});
