import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimerService {
    timeLeft = signal<number>(0);
    isActive = signal<boolean>(false);
    private interval: any;

    startTimer(seconds: number = 90) {
        this.stopTimer();
        this.timeLeft.set(seconds);
        this.isActive.set(true);

        this.interval = setInterval(() => {
            this.timeLeft.update(time => {
                if (time <= 1) {
                    this.stopTimer();
                    this.playAlarm();
                    return 0;
                }
                return time - 1;
            });
        }, 1000);
    }

    stopTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.isActive.set(false);
    }

    private playAlarm() {
        // In a real app, we would play a sound file
        console.log('TIMER DONE! PLAYING ALARM SOUND...');
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
        } catch (e) {
            console.error('Could not play alarm sound', e);
        }
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
