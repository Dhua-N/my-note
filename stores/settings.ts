import { defineStore } from 'pinia'

interface FontSettings {
  family: string
  size: number // px
  lineHeight: number
}

interface SettingsState {
  font: FontSettings
  theme: 'light' | 'dark'
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    font: {
      family: 'Inter, sans-serif',
      size: 16,
      lineHeight: 1.6
    },
    theme: 'light'
  }),
  
  actions: {
    updateFont(font: Partial<FontSettings>) {
      this.font = { ...this.font, ...font }
      this.saveToStorage()
    },
    
    loadFromStorage() {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        Object.assign(this, JSON.parse(saved))
      }
    },
    
    saveToStorage() {
      localStorage.setItem('app-settings', JSON.stringify({
        font: this.font,
        theme: this.theme
      }))
    }
  }
})