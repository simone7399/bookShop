<template>
    <div class="bookshelf-page">
        <h1>My Bookshelf</h1>

        <p v-if="bookshelf.counts.total === 0" class="empty-state">
            Your bookshelf is empty. Add some books from the detail pages!
        </p>

        <section
            v-for="section in sections"
            :key="section.status"
            class="shelf-section"
        >
            <h2>
                {{ section.title }}
                <span class="count">({{ bookshelf.byStatus(section.status).length }})</span>
            </h2>

            <p v-if="bookshelf.byStatus(section.status).length === 0" class="empty">
                No books here yet.
            </p>

            <div v-else class="book-grid">
                <div
                    v-for="book in bookshelf.byStatus(section.status)"
                    :key="book.key"
                    class="book-card"
                >
                    <img
                        v-if="book.cover_i"
                        :src="`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`"
                        :alt="book.title"
                    />
                    <div v-else class="no-cover">No cover</div>

                    <h3>{{ book.title }}</h3>
                    <p class="author">{{ book.author_name?.join(', ') || 'Unknown' }}</p>

                    <div class="card-controls">
                        <select
                            :value="book.status"
                            @change="bookshelf.setStatus(book.key, $event.target.value)"
                        >
                            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>

                        <button @click="bookshelf.removeBook(book.key)">Remove</button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { useBookshelfStore, STATUS, STATUS_OPTIONS } from '@/stores/bookshelf'

const bookshelf = useBookshelfStore()
const statusOptions = STATUS_OPTIONS

// Order you want the sections rendered in
const sections = [
    { status: STATUS.READING, title: 'Reading' },
    { status: STATUS.TBR, title: 'To Be Read' },
    { status: STATUS.FINISHED, title: 'Finished' }
]
</script>

<style scoped>
.shelf-section {
    margin-bottom: 2.5rem;
}

.count {
    font-size: 0.9rem;
    font-weight: normal;
    color: #666;
}

.empty,
.empty-state {
    color: #777;
    font-style: italic;
}

.book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
}

.book-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
}

.book-card img,
.no-cover {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 4px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 0.85rem;
}

.book-card h3 {
    font-size: 1rem;
    margin: 0.5rem 0 0.25rem;
}

.author {
    font-size: 0.85rem;
    color: #555;
    margin: 0 0 0.5rem;
}

.card-controls {
    margin-top: auto;
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.card-controls select {
    flex: 1;
    padding: 0.25rem;
}
</style>