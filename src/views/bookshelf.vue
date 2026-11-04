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
    color: var(--color-text-muted);
}

.empty,
.empty-state {
    color: var(--color-text-muted);
    font-style: italic;
}

.empty-state {
    padding: 1.25rem 1.5rem;
    border: 1px dashed var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
}

.book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr));
    gap: 1.25rem;
}

.book-card {
    min-width: 0;
    padding: 0.9rem;
    border: 1px solid var(--color-border);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.025), transparent 55%), var(--color-surface);
    display: flex;
    flex-direction: column;
    transition: border-color 180ms ease, transform 180ms ease;
}

.book-card:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-2px);
}

.book-card img,
.no-cover {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface-raised);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-family: var(--font-ui);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.book-card h3 {
    margin: 0.85rem 0 0.25rem;
    font-size: 1.05rem;
    line-height: 1.4;
}

.author {
    margin: 0 0 1rem;
    color: var(--color-text-muted);
    font-size: 0.82rem;
}

.card-controls {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
}

.card-controls select {
    flex: 1 1 110px;
    min-width: 0;
    padding: 0.55rem 0.6rem;
    font-family: var(--font-ui);
    font-size: 0.78rem;
}

.card-controls button {
    color: var(--color-error);
}

@media (max-width: 480px) {
    .book-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
    }

    .book-card {
        padding: 0.65rem;
    }

    .book-card img,
    .no-cover {
        height: 190px;
    }

    .card-controls {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>