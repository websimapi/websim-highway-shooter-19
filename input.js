export default class InputHandler {
    constructor(game) {
        this.game = game;
        this.targetX = game.width / 2;

        this.isDragging = false;
        // The following properties are no longer needed for drag move,
        // but are kept for tap detection logic.
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.tapThreshold = 10; // Max pixels moved to be considered a tap

        // Keyboard controls (movement removed)
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') { // Space bar
                e.preventDefault();
                this.game.player.useBomb();
            }
        });

        // Touch and Mouse controls
        const getEventX = (e) => e.touches ? e.touches[0].clientX : e.clientX;
        const getEventY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

        const canvas = document.getElementById('game-canvas');

        const handleStart = (e) => {
            this.isDragging = true;
            this.touchStartX = getEventX(e);
            this.touchStartY = getEventY(e);

            // Immediately move to the start position
            handleMove(e);
            
            if (e.type === 'touchstart') e.preventDefault();
        };

        const handleMove = (e) => {
             // For desktop, we follow the mouse even if not dragging
            const isMouseEvent = e.type === 'mousemove';
            if (!this.isDragging && !isMouseEvent) return;
            
            const canvasRect = canvas.getBoundingClientRect();
            // Calculate mouse/touch X relative to the canvas element
            const currentX = getEventX(e) - canvasRect.left;

            // Directly set the target to the current position within the canvas
            this.targetX = currentX;
            
            this.clampTargetX();
        };

        const handleEnd = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;

            const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

            const dx = endX - this.touchStartX;
            const dy = endY - this.touchStartY;

            // If the finger/mouse moved less than the threshold, it's a tap/click
            if (Math.sqrt(dx * dx + dy * dy) < this.tapThreshold) {
                this.game.player.useBomb();
            }
        };
        
        // Wire up all the events
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e);
        }, { passive: false });

        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
    }

    resize(oldGameWidth) {
        if (oldGameWidth > 0) {
            const targetXRatio = this.targetX / oldGameWidth;
            this.targetX = this.game.width * targetXRatio;
            this.clampTargetX();
        } else {
            this.targetX = this.game.width / 2;
        }
    }

    clampTargetX() {
        this.targetX = Math.max(this.game.player.width / 2, Math.min(this.game.width - this.game.player.width / 2, this.targetX));
    }
}