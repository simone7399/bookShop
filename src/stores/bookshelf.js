// src/stores/bookshelf.js
import { defineStore } from 'pinia'

export const STATUS = {
  TBR: 'tbr',
  READING: 'reading',
  FINISHED: 'finished'
}

export const STATUS_OPTIONS = [
  { value: STATUS.TBR, label: 'To Be Read' },
  { value: STATUS.READING, label: 'Reading' },
  { value: STATUS.FINISHED, label: 'Finished' }
]

// Load + migrate: older saves have no `status`, so default them to TBR.
function loadFromStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem('bookshelf')) || []
    return raw.map(b => ({ status: STATUS.TBR, ...b }))
  } catch {
    return []
  }
}

export const useBookshelfStore = defineStore('bookshelf', {
  state: () => ({
    books: loadFromStorage()
  }),

  getters: {
    isOnBookshelf: (state) => (bookKey) =>
      state.books.some(b => b.key === bookKey),

    getBook: (state) => (bookKey) =>
      state.books.find(b => b.key === bookKey),

    getStatus: (state) => (bookKey) =>
      state.books.find(b => b.key === bookKey)?.status ?? null,

    byStatus: (state) => (status) =>
      state.books.filter(b => b.status === status),

    counts: (state) => ({
      tbr: state.books.filter(b => b.status === STATUS.TBR).length,
      reading: state.books.filter(b => b.status === STATUS.READING).length,
      finished: state.books.filter(b => b.status === STATUS.FINISHED).length,
      total: state.books.length
    })
  },

  actions: {
    addBook(book, status = STATUS.TBR) {
      if (this.isOnBookshelf(book.key)) return
      this.books.push({ ...book, status })
      this.saveToLocalStorage()
    },

    removeBook(bookKey) {
      this.books = this.books.filter(b => b.key !== bookKey)
      this.saveToLocalStorage()
    },

    setStatus(bookKey, status) {
      const book = this.books.find(b => b.key === bookKey)
      if (!book) return
      book.status = status
      this.saveToLocalStorage()
    },

    toggleBook(book, status = STATUS.TBR) {
      if (this.isOnBookshelf(book.key)) this.removeBook(book.key)
      else this.addBook(book, status)
    },

    clearBookshelf() {
      this.books = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('bookshelf', JSON.stringify(this.books))
    }
  }
})