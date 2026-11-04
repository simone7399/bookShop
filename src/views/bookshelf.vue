<script setup>
import { useBookshelfStore } from '@/stores/bookshelf'
import { storeToRefs } from 'pinia'

const bookshelfStore = useBookshelfStore()
const { books } = storeToRefs(bookshelfStore)
</script>

<template>
  <div class="bookshelf-page">
    <h1>My Bookshelf</h1>

    <div v-if="books.length === 0" class="empty-state">
      Your bookshelf is empty. Add some books from the detail pages!
    </div>

    <div v-else class="book-grid">
      <div v-for="book in books" :key="book.key" class="book-card">
        <!-- Adjust these fields to match the Open Library API response -->
        <img 
          :src="`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`" 
          :alt="book.title" 
        />
        <h3>{{ book.title }}</h3>
        <p>{{ book.author_name?.join(', ') }}</p>
        
        <button @click="bookshelfStore.removeBook(book.key)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>