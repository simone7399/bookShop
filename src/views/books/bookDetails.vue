<template>
    <h1>Book Details</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error-message">{{ error }}</p>

    <article v-if="book" class="book-detail">
        <h2>{{ book.title }}</h2>

        <img
            v-if="coverId"
            :src="`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`"
            :alt="book.title"
            class="book-cover"
        />

        <div class="book-info">
            <p class="book-author"><strong>Author:</strong> {{ author || 'Unknown' }}</p>

            <button
                v-if="!isOnBookshelf"
                class="bookshelf-btn add"
                :disabled="loading"
                @click="addToBookshelf"
            >
                + Add to Bookshelf
            </button>

            <div v-else class="bookshelf-controls">
                <label>
                    Status:
                    <select :value="currentStatus" @change="changeStatus">
                        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </label>

                <button class="bookshelf-btn remove" @click="removeFromBookshelf">
                    Remove from Bookshelf
                </button>
            </div>

            <h3>About this book</h3>
            <p>{{ formatDescription(book.description) || 'No description available.' }}</p>
        </div>
    </article>

    <div class="nav-links">
        <RouterLink to="/books">← Back to books</RouterLink>
        <RouterLink to="/bookshelf">View my bookshelf →</RouterLink>
    </div>
</template>

<script>
import { useBookshelfStore, STATUS_OPTIONS } from '@/stores/bookshelf'

export default {
    props: ['id'],

    data() {
        return {
            book: null,
            author: '',
            loading: true,
            error: null,
            statusOptions: STATUS_OPTIONS
        }
    },

    computed: {
        bookshelf() {
            return useBookshelfStore()
        },

        coverId() {
            return this.book?.covers?.[0] || null
        },

        isOnBookshelf() {
            return this.book ? this.bookshelf.isOnBookshelf(this.book.key) : false
        },

        currentStatus() {
            return this.book ? this.bookshelf.getStatus(this.book.key) : null
        }
    },

    async mounted() {
        try {
            const res = await fetch(
                `https://openlibrary.org/works/${this.id}.json`
            )
            if (!res.ok) throw new Error('Could not load book')
            this.book = await res.json()

            if (this.book.authors && this.book.authors.length > 0) {
                const key = this.book.authors[0].author.key
                const aRes = await fetch(`https://openlibrary.org${key}.json`)
                if (aRes.ok) {
                    const aData = await aRes.json()
                    this.author = aData.name
                }
            }
        } catch (e) {
            this.error = e.message
        } finally {
            this.loading = false
        }
    },

    methods: {
        formatDescription(desc) {
            if (!desc) return ''
            return typeof desc === 'string' ? desc : desc.value || ''
        },

        // Normalise the work object into the shape the bookshelf expects
        bookPayload() {
            return {
                key: this.book.key,
                title: this.book.title,
                cover_i: this.coverId,
                author_name: this.author ? [this.author] : []
            }
        },

        addToBookshelf() {
            if (!this.book) return
            this.bookshelf.addBook(this.bookPayload()) // defaults to TBR
        },

        changeStatus(event) {
            this.bookshelf.setStatus(this.book.key, event.target.value)
        },

        removeFromBookshelf() {
            this.bookshelf.removeBook(this.book.key)
        }
    }
}
</script>

<style scoped>
.book-detail {
    grid-template-columns: minmax(130px, 220px) minmax(0, 1fr);
    column-gap: clamp(1.5rem, 5vw, 4rem);
}

.book-detail h2 {
    grid-column: 1 / -1;
}

.book-detail .book-cover {
    grid-column: 1;
    grid-row: 2;
    width: 100%;
    max-width: 220px;
    max-height: 330px;
    object-fit: cover;
}

.book-info {
    grid-column: 2;
    grid-row: 2;
    min-width: 0;
}

.book-info h3 {
    margin: 2rem 0 0.65rem;
}

.book-info > p:last-child {
    line-height: 1.9;
}

.book-author {
    margin: 0 0 1.25rem;
}

.book-author strong {
    color: var(--color-text);
}

.bookshelf-btn {
    display: inline-block;
    padding: 0.75rem 1rem;
}

.bookshelf-btn.add {
    border-color: var(--color-accent-soft);
    background: var(--color-accent-soft);
    color: var(--color-background);
}

.bookshelf-btn.remove {
    border-color: var(--color-error);
    color: var(--color-error);
}

.bookshelf-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    margin: 1.25rem 0;
}

.bookshelf-controls select {
    margin-left: 0.5rem;
    font-family: var(--font-ui);
    font-size: 0.85rem;
}

.nav-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 2rem;
}

@media (max-width: 640px) {
    .book-detail {
        grid-template-columns: minmax(0, 1fr);
        row-gap: 1.5rem;
    }

    .book-detail h2,
    .book-detail .book-cover,
    .book-info {
        grid-column: 1;
        grid-row: auto;
    }

    .book-detail .book-cover {
        width: min(70%, 220px);
        margin: 0 auto;
    }
}
</style>