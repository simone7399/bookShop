// src/stores/bookshelf.js
import { defineStore } from 'pinia'

export const useBookshelfStore = defineStore('bookshelf', {
  state: () => ({
    // Load initial state from localStorage if it exists
    books: JSON.parse(localStorage.getItem('bookshelf')) || []
  }),

  getters: {
    // Check if a book is already on the bookshelf by its Open Library key
    isOnBookshelf: (state) => (bookKey) => {
      return state.books.some(book => book.key === bookKey)
    },

    // Get the total number of books
    totalBooks: (state) => state.books.length,

    // Get all books sorted alphabetically by title
    sortedBooks: (state) => {
      return [...state.books].sort((a, b) => 
        (a.title || '').localeCompare(b.title || '')
      )
    }
  },

  actions: {
    // Add a book to the bookshelf
    addBook(book) {
      // Prevent duplicates by checking the unique Open Library key
      if (!this.isOnBookshelf(book.key)) {
        this.books.push(book)
        this.saveToLocalStorage()
      }
    },

    // Remove a book from the bookshelf
    removeBook(bookKey) {
      this.books = this.books.filter(book => book.key !== bookKey)
      this.saveToLocalStorage()
    },

    // Toggle add/remove for convenience
    toggleBook(book) {
      if (this.isOnBookshelf(book.key)) {
        this.removeBook(book.key)
      } else {
        this.addBook(book)
      }
    },

    // Clear the entire bookshelf
    clearBookshelf() {
      this.books = []
      this.saveToLocalStorage()
    },

    // Persist current state to localStorage
    saveToLocalStorage() {
      localStorage.setItem('bookshelf', JSON.stringify(this.books))
    }
  }
})