<template>
    <h1>Books</h1>
    <div v-for="book in books" :key="book.id">
        <RouterLink :to="{ name: 'bookDetails', params: { id: book.id } }">
            <h2>{{ book.title }}</h2>
        </RouterLink>
        <p>Author: {{ book.author }}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            books: [
               { title: 'Book 1', id: 1, author: 'Author 1' },
               { title: 'Book 2', id: 2, author: 'Author 2' },
               { title: 'Book 3', id: 3, author: 'Author 3' }
            ]
        }
    }
}
</script>

<style>

</style>